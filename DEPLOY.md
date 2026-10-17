# 🛡️ Guia Oficial de Deploy e Produção — Sanctuary RPG

Este guia detalha o passo a passo completo para publicar a aplicação **Sanctuary RPG** em produção na plataforma **Vercel** (plano gratuito), conectando-a a um banco de dados em nuvem **Supabase (PostgreSQL)** para persistência automática e sincronização contínua das fichas dos personagens.

---

## 🏛️ Arquitetura de Produção

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS (hospedado na CDN global da **Vercel**).
- **Roteamento SPA:** Garantido via `vercel.json` com reescrita automática de rotas para `/index.html` (zero erros 404 ao atualizar a página).
- **Banco de Dados em Nuvem:** **Supabase (PostgreSQL)** com armazenamento em documento JSONB (`sanctuary_saves`) e bucket de mídia (`sanctuary-images`).
- **Resiliência Offline-First:** Todas as alterações feitas na ficha (pontos de vida, munições carmesim, gambiarras, condições ativas, atributos, moedas e armas) são salvas instantaneamente no `localStorage` do navegador e sincronizadas em segundo plano com o Supabase via *debounce* de 1.2s.

---

## 📋 Passo 1: Configurar a Base de Dados no Supabase (Gratuito)

1. Aceda a [https://supabase.com](https://supabase.com) e crie uma conta gratuita (ou faça login com o GitHub).
2. No painel de controle, clique em **"New Project"**.
3. Preencha as informações:
   - **Name:** `sanctuary-rpg` (ou o nome que desejar).
   - **Database Password:** Escolha uma senha forte e guarde-a em segurança.
   - **Region:** Selecione a região mais próxima do seu público (ex: `South America (São Paulo)` ou `East US`).
   - **Pricing Plan:** Escolha o plano **Free** ($0/mês).
4. Clique em **"Create new project"** e aguarde 1 a 2 minutos até o banco ser provisionado.

### Executar o Esquema SQL
5. No menu lateral esquerdo do Supabase, clique no ícone **SQL Editor** (`>_`).
6. Clique em **"New query"** e cole todo o conteúdo do ficheiro [`supabase/schema.sql`](./supabase/schema.sql):
   - Ele criará a tabela `public.sanctuary_saves`.
   - Configurará o Row Level Security (RLS) para permitir leitura e gravação da ficha com segurança.
   - Criará a função e o gatilho automático para manter o campo `updated_at` atualizado.
   - Criará o bucket de armazenamento `sanctuary-images` para uploads de fotos de personagens e arsenais.
7. Clique no botão verde **"Run"** (ou aperte `Ctrl + Enter`). Você verá a mensagem `Success: No rows returned`.

### Obter as Chaves de Conexão (API Keys)
8. No menu lateral esquerdo, clique no ícone de engrenagem **Project Settings** > **API**.
9. Na seção **Project API keys**, copie:
   - **Project URL:** Ex: `https://xyzcompany.supabase.co`
   - **Project API Keys (`anon` / `public`):** Ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> ⚠️ **Importante:** Utilize sempre a chave `anon` (`public`). **NUNCA** exponha a chave `service_role` (secreta) no frontend!

---

## 🐙 Passo 2: Enviar o Código para o GitHub

Se ainda não enviou as alterações mais recentes para o GitHub, execute no terminal:

```bash
# 1. Verifique os ficheiros alterados
git status

# 2. Adicione todos os ficheiros ao versionamento
git add .

# 3. Crie o commit
git commit -m "feat: configuracao de deploy na Vercel e persistencia Supabase"

# 4. Envie para o seu repositório remoto no GitHub
git push origin main
```

---

## ⚡ Passo 3: Publicar na Vercel (Deploy Gratuito)

1. Aceda a [https://vercel.com](https://vercel.com) e faça login com a sua conta GitHub.
2. No painel principal (**Overview**), clique no botão **"Add New..."** > **"Project"**.
3. Em **"Import Git Repository"**, procure o repositório `sanctuary-rpg` e clique em **"Import"**.
4. Na tela de configuração do projeto (**Configure Project**):
   - **Project Name:** `sanctuary-rpg` (ou outro nome de sua preferência).
   - **Framework Preset:** Selecione **Vite** (geralmente detectado automaticamente).
   - **Root Directory:** `./`
   - **Build Command:** Deixe o padrão (`npm run build`).
   - **Output Directory:** Deixe o padrão (`dist`).
5. Expanda a seção **"Environment Variables"** e adicione as duas variáveis obtidas no Supabase:

| Nome da Variável | Valor | Exemplo |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Sua Project URL | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sua chave Anon Pública | `eyJhbGciOi...` |

6. Clique no botão azul **"Deploy"**.
7. Aguarde cerca de 1 minuto enquanto a Vercel compila a aplicação. Ao finalizar, você verá a animação de comemoração e receberá a URL oficial de produção (ex: `https://sanctuary-rpg.vercel.app`).

---

## 🧪 Passo 4: Verificação e Testes em Produção

Após abrir a sua URL na Vercel:

1. **Teste de Roteamento SPA:**
   - Navegue entre as abas (*Santuário*, *Arsenal Tático*, *Inventário*, *Auxiliar Tático*).
   - Atualize a página no navegador (`F5` ou `Ctrl + R`). A página deve recarregar perfeitamente sem erros `404 Not Found`, graças ao ficheiro `vercel.json`.
2. **Teste de Autenticação e Usuário:**
   - Na tela inicial, entre com as credenciais padrão (`CapMarcola` / `Gellak@2520`) ou com sua conta.
3. **Indicador de Sincronização em Nuvem:**
   - Observe o topo direito da tela. Ao realizar qualquer ação na ficha (gastar ou recuperar pontos de vida, desmarcar ou marcar slots de munição carmesim, alterar gambiarras ou alternar condições), você verá o selo:
     - `Salvando...` com ícone giratório.
     - `Sincronizado` acompanhado pelo ícone de **Nuvem**, confirmando que os dados foram persistidos no Supabase.
4. **Verificação no Supabase:**
   - Aceda ao painel do Supabase > **Table Editor** > tabela `sanctuary_saves`.
   - Você verá uma linha com o `user_id` e a coluna `characters` preenchida com o JSON completo do personagem e seu `updated_at` atualizado.
5. **Modal de Configurações:**
   - Clique no ícone de engrenagem no cabeçalho.
   - Na seção **Sincronização & Nuvem**, você verá o status `Supabase Ativo`, a conta ativa e o botão **"Sincronizar Agora com a Nuvem"** para forçar um envio manual a qualquer momento.

---

## 🛠️ Manutenção e Resolução de Problemas

### E se as credenciais do Supabase não forem configuradas?
A aplicação continuará a funcionar perfeitamente em **Modo Local (Offline)**. Todas as alterações serão salvas no `localStorage` do navegador e no indicador aparecerá o ícone de **Disco Rígido (Salvo localmente)**.

### Como atualizar as variáveis de ambiente na Vercel?
Se você precisar alterar as chaves do Supabase após o deploy:
1. Vá até o seu projeto na Vercel > **Settings** > **Environment Variables**.
2. Edite os valores de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Vá para a aba **Deployments**, clique nos três pontos `...` do último deploy e selecione **Redeploy** para aplicar as novas variáveis.

### Comandos de Validação Local
Antes de realizar novos deploys futuros, você pode testar a integridade do código localmente:

```bash
# Validação de tipagem e integridade
npm run lint

# Compilação de produção
npm run build

# Pré-visualização da compilação local
npm run preview
```
