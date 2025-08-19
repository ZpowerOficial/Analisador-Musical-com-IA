<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎵 Analisador Musical com IA

Uma ferramenta que utiliza a IA Gemini para fornecer análise musical detalhada de músicas a partir de links do YouTube, atuando como um musicólogo acadêmico, engenheiro de som e compositor profissional.

## ✨ Funcionalidades

- 🎯 **Análise Precisa**: Identifica especificamente o vídeo pelo ID do YouTube
- 🎼 **Análise Completa**: Elementos musicais, composição, engenharia de som, letras e contexto cultural
- 🔍 **Validação de URL**: Verifica se o link do YouTube é válido antes da análise
- 📊 **Interface Intuitiva**: Design moderno e responsivo com Tailwind CSS
- 🛡️ **Segurança**: Chave de API processada apenas no navegador

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Chave de API do Google Gemini

### Passos

1. **Clone e instale dependências:**
   ```bash
   npm install
   ```

2. **Configure a API Gemini:**
   - Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Crie uma chave de API
   - **IMPORTANTE**: Habilite a Generative Language API:
     - Vá para [Google Cloud Console](https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview)
     - Clique em "Habilitar API"
     - Aguarde alguns minutos para ativação

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

4. **Acesse:** http://localhost:5173/

## 🔧 Configuração da API

### Problemas Comuns

**Erro "SERVICE_DISABLED":**
- A Generative Language API não está habilitada
- Solução: Acesse o [Console do Google Cloud](https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview) e habilite a API

**Erro "PERMISSION_DENIED":**
- Chave de API inválida ou sem permissões
- Solução: Verifique se a chave está correta e se tem as permissões necessárias

**Erro "QUOTA_EXCEEDED":**
- Cota da API excedida
- Solução: Verifique os limites no Google Cloud Console

## 🎯 Como Usar

1. **Insira sua chave de API** do Google Gemini no campo apropriado
2. **Cole um link do YouTube** de uma música (formatos suportados):
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://youtube.com/embed/VIDEO_ID`
3. **Clique em "Analisar Música"**
4. **Aguarde a análise** (pode levar alguns segundos)
5. **Visualize os resultados** detalhados

## 🔒 Segurança

- Sua chave de API é processada apenas no seu navegador
- Nenhuma informação é armazenada em servidores
- Todas as requisições são feitas diretamente para a API do Google

## 🛠️ Tecnologias

- **React 19** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **Google Gemini API** - Análise musical com IA

## 📝 Estrutura do Projeto

```
├── components/          # Componentes React
│   ├── AnalysisDisplay.tsx
│   ├── URLInput.tsx
│   └── icons/
├── services/           # Serviços da API
│   └── geminiService.ts
├── types.ts           # Definições de tipos
└── App.tsx           # Componente principal
```
