/**
 * storage.ts — Camada de persistência do Sanctuary
 *
 * Estratégia:
 *  1. Sempre salva localmente (localStorage) como cache imediato.
 *  2. Se Supabase estiver configurado e o usuário autenticado, sincroniza na nuvem.
 *  3. Na leitura, prefere dados da nuvem; usa localStorage como fallback offline.
 */

import type { Character } from '../types/character'
import { supabase, isSupabaseConfigured } from './supabase'

const LOCAL_KEY = 'sanctuary_characters_v2'
const LOCAL_ACTIVE_KEY = 'sanctuary_active_character_id'

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────

export function saveCharactersLocal(characters: Character[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(characters))
  } catch (e) {
    console.error('[Sanctuary] Falha ao salvar localmente:', e)
  }
}

export function loadCharactersLocal(): Character[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Character[]
  } catch {
    return null
  }
}

export function saveActiveIdLocal(id: string): void {
  localStorage.setItem(LOCAL_ACTIVE_KEY, id)
}

export function loadActiveIdLocal(): string | null {
  return localStorage.getItem(LOCAL_ACTIVE_KEY)
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────

export async function syncCharactersToCloud(
  userId: string,
  characters: Character[]
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null } // Silencioso quando não configurado
  }

  const { error } = await supabase.from('sanctuary_saves').upsert(
    {
      user_id: userId,
      characters: characters,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('[Sanctuary] Falha ao sincronizar com a nuvem:', error)
    return { error: error.message }
  }

  return { error: null }
}

export async function loadCharactersFromCloud(
  userId: string
): Promise<{ data: Character[] | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('sanctuary_saves')
    .select('characters')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = não encontrado, normal na primeira vez
    return { data: null, error: error.message }
  }

  return { data: (data?.characters as Character[]) ?? null, error: null }
}

// ─── UPLOAD DE IMAGEM (Base64 via localStorage / Supabase Storage) ──────────

/**
 * Converte um File para base64 para armazenamento local.
 * Para Supabase Storage, use uploadImageToStorage().
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload de imagem para Supabase Storage.
 * Retorna a URL pública da imagem ou null em caso de erro.
 */
export async function uploadImageToStorage(
  file: File,
  userId: string,
  folder: string
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    // Fallback: converte para base64 local
    try {
      const base64 = await fileToBase64(file)
      return { url: base64, error: null }
    } catch (e) {
      return { url: null, error: 'Falha ao processar imagem localmente.' }
    }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${folder}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('sanctuary-images')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    // Fallback para base64 se storage falhar
    try {
      const base64 = await fileToBase64(file)
      return { url: base64, error: null }
    } catch {
      return { url: null, error: uploadError.message }
    }
  }

  const { data } = supabase.storage.from('sanctuary-images').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
