# Wedding Memories API

Uma API Python para gerenciar memórias de casamento, incluindo fotos, vídeos, áudios e mensagens.

## Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd wedding-memories-api
```

2. Crie um ambiente virtual:
```bash
python -m venv venv
```

3. Ative o ambiente virtual:

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

4. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Executando o Projeto

1. Inicie o servidor:
```bash
python main.py
```

O servidor estará rodando em `http://localhost:8000`

2. Acesse a documentação da API:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Estrutura do Banco de Dados

O projeto usa SQLite como banco de dados local. O arquivo do banco de dados (`wedding_memories.db`) será criado automaticamente na primeira execução.

### Tabelas:
- `weddings`: Informações sobre os casamentos
- `guests`: Lista de convidados
- `photos`: Fotos enviadas pelos convidados
- `videos`: Vídeos enviados pelos convidados
- `audios`: Áudios enviados pelos convidados
- `messages`: Mensagens enviadas pelos convidados

## Endpoints da API

### Casamentos
- `POST /weddings/`: Criar novo casamento
- `GET /weddings/`: Listar todos os casamentos
- `GET /weddings/{wedding_id}`: Obter detalhes de um casamento

### Convidados
- `POST /guests/`: Registrar novo convidado
- `GET /weddings/{wedding_id}/guests/`: Listar convidados de um casamento

### Memórias
- `POST /memories/photos/`: Enviar foto
- `POST /memories/videos/`: Enviar vídeo
- `POST /memories/audios/`: Enviar áudio
- `POST /memories/messages/`: Enviar mensagem
- `GET /weddings/{wedding_id}/memories/`: Obter todas as memórias de um casamento