import React, { useState, useRef } from 'react';
import { Image, Upload, X, Camera, Video, Play, Pause } from 'lucide-react';
import { useMemories } from '../lib/hooks/useMemories';

interface MediaUploadProps {
  guestId: string;
  weddingId: string;
}

function MediaUpload({ guestId, weddingId }: MediaUploadProps) {
  const { addPhoto, addVideo } = useMemories(weddingId, guestId);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      // Request both video and audio permissions for video mode
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment', // Use back camera by default on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: isVideoMode 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        setError(null);

        if (isVideoMode) {
          mediaRecorderRef.current = new MediaRecorder(stream);
          chunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setFile(new File([blob], 'video.webm', { type: 'video/webm' }));
            setPreview(URL.createObjectURL(blob));
            stopCamera();
          };
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setIsRecording(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            setFile(file);
            setPreview(URL.createObjectURL(blob));
            stopCamera();
          }
        }, 'image/jpeg', 0.95); // High quality JPEG
      }
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording) {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('O arquivo é muito grande. O tamanho máximo é 10MB.');
        return;
      }

      // Validate file type
      const validTypes = isVideoMode 
        ? ['video/mp4', 'video/webm', 'video/quicktime']
        : ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError(`Formato de arquivo não suportado. Use ${isVideoMode ? 'MP4, WebM ou MOV' : 'JPG, PNG, HEIC ou HEIF'}.`);
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Create a new File object with the correct name and type
      const formFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });

      if (isVideoMode) {
        await addVideo(formFile);
      } else {
        await addPhoto(formFile);
      }
      handleRemove();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Falha ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFile(null);
    setError(null);
    stopCamera();
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setIsVideoMode(false);
            handleRemove();
          }}
          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
            !isVideoMode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Image size={20} />
          <span>Foto</span>
        </button>
        <button
          onClick={() => {
            setIsVideoMode(true);
            handleRemove();
          }}
          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
            isVideoMode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Video size={20} />
          <span>Vídeo</span>
        </button>
      </div>

      {!preview && !isCapturing ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={startCamera}
            className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors flex flex-col items-center justify-center text-gray-500"
          >
            <Camera className="w-12 h-12 mb-2" />
            <span>Usar Câmera</span>
          </button>

          <label className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer transition-colors flex flex-col items-center justify-center text-gray-500">
            <input
              ref={fileInputRef}
              type="file"
              accept={isVideoMode ? "video/*" : "image/*"}
              className="hidden"
              onChange={handleFileChange}
              capture={isVideoMode ? "camcorder" : "camera"}
            />
            <Upload className="w-12 h-12 mb-2" />
            <span>Enviar Arquivo</span>
          </label>
        </div>
      ) : isCapturing ? (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={!isVideoMode}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            {isVideoMode ? (
              isRecording ? (
                <button
                  onClick={stopRecording}
                  className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors animate-pulse"
                >
                  <X size={24} />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Video size={24} />
                </button>
              )
            ) : (
              <button
                onClick={capturePhoto}
                className="bg-white text-purple-600 p-4 rounded-full hover:bg-purple-50 transition-colors"
              >
                <Camera size={24} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black group">
            {isVideoMode ? (
              <video
                src={preview || undefined}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview || undefined}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Remover mídia"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRemove}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <X size={20} />
              <span>Remover</span>
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-purple-300 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Upload className="animate-bounce" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload />
                  <span>Enviar {isVideoMode ? 'Vídeo' : 'Foto'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUpload;