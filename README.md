# Livvo Smart

Aplicativo de busca de imóveis com mapa interativo para corretores e imobiliárias.

## Funcionalidades

- Busca de imóveis por localização com mapa interativo (Google Maps)
- Filtros por tipo (terreno, casa, apartamento), valor e características
- Busca por texto natural (ex: "terreno no Jardim América até 100 mil")
- Visualização de detalhes do imóvel com galeria de fotos
- Contato direto via WhatsApp
- Compartilhamento de imóveis

## Tecnologias

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Mapas**: Google Maps (react-native-maps)
- **Navegação**: React Navigation

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Supabase](https://supabase.com)
- API Key do Google Maps

## Configuração

### 1. Clonar e instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase/schema.sql` no SQL Editor
3. Crie os buckets de storage: `imoveis` e `avatars`

### 4. Configurar Google Maps

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Ative a API do Google Maps para Android e iOS
3. Adicione as chaves em `app.json`:
   - `expo.android.config.googleMaps.apiKey`
   - `expo.ios.config.googleMapsApiKey`

## Executar

```bash
# Desenvolvimento
npm start

# Android
npm run android

# iOS
npm run ios
```

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── screens/          # Telas do aplicativo
├── services/         # Serviços (Supabase, API)
├── hooks/            # Hooks customizados
├── types/            # Tipos TypeScript
├── utils/            # Funções utilitárias
├── constants/        # Constantes e configurações
└── assets/           # Imagens e ícones

supabase/
└── schema.sql        # Schema do banco de dados
```

## Próximos Passos

- [ ] Tela de cadastro/login para corretores
- [ ] Tela de cadastro de imóveis
- [ ] Sistema de favoritos
- [ ] Histórico de visualizações
- [ ] Notificações de novos imóveis
- [ ] Busca por voz

## Licença

Privado - Todos os direitos reservados.
