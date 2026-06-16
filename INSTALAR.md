# 📦 Instalação do CHUÁ (Docker)

Guia simples para rodar o **CHUÁ — Solicitações de Dashboard** em qualquer máquina (Windows ou Linux). Tudo (site + API + banco de dados) sobe junto com **um comando**.

---

## ✅ Pré-requisito único: Docker

Instale o Docker **uma vez** na máquina (instalador next-next):

- **Windows / Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) → instale e **abra** o programa.
- **Linux:** [Docker Engine](https://docs.docker.com/engine/install/) (`docker` + plugin `docker compose`).

> Não precisa instalar Node, PostgreSQL nem nada além do Docker. Tudo já vem dentro dos containers.

---

## ▶️ Instalar e iniciar

### Windows
1. Copie a pasta do projeto para a máquina.
2. Dê **duplo clique** em **`INSTALAR.bat`**.
3. Aguarde (a 1ª vez baixa as imagens — pode levar alguns minutos).
4. Abra o navegador em **http://localhost:8080**

### Linux
```bash
cd "caminho/do/projeto"
chmod +x instalar.sh
./instalar.sh
```
Ou diretamente:
```bash
docker compose up -d --build
```
Depois abra **http://localhost:8080**

---

## 🔑 Primeiro acesso

| Campo | Valor |
|-------|-------|
| Usuário | `adm@chua.local` |
| Senha   | `admin123` |

> **Importante:** este é o admin inicial. Crie seus usuários e troque a senha padrão.

---

## ⚙️ Personalizar (opcional)

O app funciona sem configuração. Para mudar porta, senha do banco ou segredo dos tokens, crie um arquivo **`.env`** ao lado do `docker-compose.yml` (modelo em `.env.docker.example`):

```env
APP_PORT=8080
DB_PASSWORD=Chua2026Secure
JWT_SECRET=troque_este_segredo_por_algo_aleatorio
```

Em **produção**, sempre troque `DB_PASSWORD` e `JWT_SECRET`.

---

## 🛠️ Comandos do dia a dia

| Ação | Comando |
|------|---------|
| Iniciar | `docker compose up -d` |
| Parar (mantém dados) | `docker compose stop` *(ou `PARAR.bat` no Windows)* |
| Ver status | `docker compose ps` |
| Ver logs | `docker compose logs -f` |
| Atualizar após mudar o código | `docker compose up -d --build` |
| Apagar TUDO, inclusive dados | `docker compose down -v` |

---

## ❓ Problemas comuns

- **"Docker não encontrado"** → instale o Docker e, no Windows, **abra o Docker Desktop** antes.
- **Porta 8080 ocupada** → crie o `.env` e mude `APP_PORT` (ex.: `APP_PORT=9090`).
- **Quero zerar o banco** → `docker compose down -v` e instale de novo (recria o admin inicial).
- **Os dados somem ao parar?** → Não. Ficam no volume `chua_dbdata`. Só `down -v` apaga.

---

## 🌐 Acesso por outras máquinas da rede

Se instalar em um PC/servidor e quiser acessar de outros computadores da **mesma rede**, use o IP da máquina no lugar de `localhost`:

```
http://IP-DA-MAQUINA:8080
```

(Descubra o IP com `ipconfig` no Windows ou `ip a` no Linux.)
