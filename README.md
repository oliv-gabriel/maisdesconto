# maisdesconto

MVP para acompanhar preços na Amazon, Mercado Livre e Shopee.

## Rodar localmente

```bash
npm run dev
```

Abra `http://localhost:3000`.

## O que já funciona

- Cadastro de URLs das três lojas, com identificação automática da loja.
- Registro de preço atual e preço-alvo.
- Histórico de preços, menor preço e alerta visual quando a meta é atingida.
- Persistência local no arquivo `data/products.json` (criado automaticamente).

Os três produtos que aparecem no primeiro acesso são demonstrações e podem ser apagados.

## Próxima integração

O painel e as rotas já estão separados da consulta de preços. A próxima etapa é criar os conectores oficiais e um agendador:

- Amazon Creators API + conta de Associado.
- Mercado Livre API + token OAuth.
- Shopee Programa de Afiliados + credenciais de API.

As variáveis necessárias estão listadas em `.env.example`.
