import { z } from 'zod';

// Telegram bot token format: numeric_id:alphanumeric_token
export const botTokenSchema = z.string()
  .trim()
  .regex(/^\d{8,10}:[A-Za-z0-9_-]{35}$/, 'Token inválido. Formato: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz')
  .min(20, 'Token muito curto');

// Telegram channel ID format: must start with -100
export const channelIdSchema = z.string()
  .trim()
  .regex(/^-100\d{10,}$/, 'ID do canal deve começar com -100 seguido de números');

// Telegram message max length is 4096 characters
export const messageSchema = z.string()
  .trim()
  .min(1, 'Mensagem não pode estar vazia')
  .max(4096, 'Mensagem muito longa (máximo 4096 caracteres)');

export const botNameSchema = z.string()
  .trim()
  .min(1, 'Nome do bot é obrigatório')
  .max(100, 'Nome do bot muito longo');

export const buttonTextSchema = z.string()
  .trim()
  .max(64, 'Texto do botão deve ter no máximo 64 caracteres');

export const urlSchema = z.string()
  .trim()
  .url('URL inválida')
  .max(2000, 'URL muito longa');

export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo');

export const passwordSchema = z.string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

export const nameSchema = z.string()
  .min(2, 'Nome deve ter no mínimo 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras');
