/**
 * ImageGallery.tsx
 *
 * Componente reutilizável de galeria de imagens para personagem e armas.
 * - Exibe imagem de perfil com clique para ampliar
 * - Modal de visualização ampliada
 * - Upload e gerenciamento de galeria
 * - Seleção de imagem padrão (perfil)
 */

import { useState, useRef, type FC } from 'react'
import { X, Upload, Star, StarOff, ZoomIn, Image, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { fileToBase64 } from '../lib/storage'

interface ImageGalleryProps {
  profileImageUrl?: string
  imageGallery?: string[]
  placeholderIcon?: React.ReactNode
  label?: string
  onUpdateProfile: (url: string | undefined) => void
  onUpdateGallery: (gallery: string[]) => void
  /** Tamanho do thumbnail de perfil em classes Tailwind (ex: "w-24 h-24") */
  thumbSize?: string
  /** Modo compacto — exibe apenas a foto de perfil sem botão de gerenciar */
  compact?: boolean
}

export const ImageGallery: FC<ImageGalleryProps> = ({
  profileImageUrl,
  imageGallery = [],
  placeholderIcon,
  label = 'Imagem',
  onUpdateProfile,
  onUpdateGallery,
  thumbSize = 'w-24 h-24',
  compact = false,
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Todas as imagens = galeria; a de perfil é marcada separadamente
  const allImages = imageGallery

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 8 * 1024 * 1024) {
        alert(`"${file.name}" é muito grande (máximo 8 MB).`)
        continue
      }
      try {
        const base64 = await fileToBase64(file)
        newUrls.push(base64)
      } catch {
        console.error('Falha ao processar imagem')
      }
    }

    if (newUrls.length > 0) {
      const updated = [...allImages, ...newUrls]
      onUpdateGallery(updated)
      // Se não houver imagem de perfil, define a primeira como padrão
      if (!profileImageUrl) {
        onUpdateProfile(newUrls[0])
      }
    }

    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSetAsProfile = (url: string) => {
    onUpdateProfile(url)
  }

  const handleDeleteImage = (url: string) => {
    const updated = allImages.filter((img) => img !== url)
    onUpdateGallery(updated)
    if (profileImageUrl === url) {
      onUpdateProfile(updated[0] ?? undefined)
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const lightboxPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length)
  }
  const lightboxNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % allImages.length)
  }

  return (
    <>
      {/* Thumbnail de Perfil */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => profileImageUrl && setIsGalleryOpen(true)}
          className={`${thumbSize} rounded-2xl overflow-hidden border-2 border-red-600/50 bg-zinc-900 flex items-center justify-center relative shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] hover:border-red-500`}
          title={profileImageUrl ? `Ver ${label}` : `Adicionar ${label}`}
        >
          {profileImageUrl ? (
            <>
              <img
                src={profileImageUrl}
                alt={label}
                fetchPriority="high"
                loading="eager"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-zinc-600 gap-1">
              {placeholderIcon ?? <Image size={28} />}
              <span className="text-[9px] font-medium uppercase tracking-wider">Adicionar</span>
            </div>
          )}
        </button>

        {/* Botão flutuante de gerenciar galeria */}
        {!compact && (
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.6)] flex items-center justify-center text-white transition-all active:scale-95"
            title="Gerenciar galeria"
          >
            <Upload size={12} />
          </button>
        )}
      </div>

      {/* Modal de Galeria */}
      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsGalleryOpen(false)}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsGalleryOpen(false)}
          />

          {/* Painel da galeria */}
          <div className="relative z-10 w-full sm:max-w-lg bg-[#111015] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <div>
                <h3
                  className="text-base font-black text-white"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Galeria — {label}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {allImages.length} imagem{allImages.length !== 1 ? 's' : ''} • Clique na estrela para definir o perfil
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Botão de Upload */}
              <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-dashed border-red-800/50 hover:border-red-600 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Upload size={16} />
                {isUploading ? 'Processando...' : 'Adicionar imagens (múltiplas)'}
              </label>

              {/* Grid de imagens */}
              {allImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                  <Image size={40} className="mb-3 opacity-50" />
                  <p className="text-sm text-center">
                    Nenhuma imagem ainda.<br />
                    Adicione fotos para criar a galeria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allImages.map((url, idx) => {
                    const isProfile = url === profileImageUrl
                    return (
                      <div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden aspect-square border-2 transition-all ${isProfile
                          ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'border-white/10 hover:border-white/30'
                          }`}
                      >
                        <img
                          src={url}
                          alt={`${label} ${idx + 1}`}
                          loading="eager"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openLightbox(idx)}
                        />

                        {/* Overlay de ações */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openLightbox(idx)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                            title="Ampliar"
                          >
                            <ZoomIn size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAsProfile(url)}
                            className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-xl transition-all ${isProfile
                              ? 'bg-amber-500/30 text-amber-400'
                              : 'bg-white/20 hover:bg-amber-500/30 text-white hover:text-amber-400'
                              }`}
                            title={isProfile ? 'Imagem de perfil atual' : 'Definir como perfil'}
                          >
                            {isProfile ? <Star size={14} /> : <StarOff size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(url)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-white/20 hover:bg-red-600/50 text-white hover:text-red-300 transition-all"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Badge de perfil */}
                        {isProfile && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                            <Star size={8} />
                            Perfil
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox de visualização ampliada */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          {/* Imagem centralizada */}
          <img
            src={allImages[lightboxIndex]}
            alt={`${label} ampliado`}
            loading="eager"
            fetchPriority="high"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl select-none"
          />

          {/* Botão Fechar */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all"
          >
            <X size={22} />
          </button>

          {/* Navegação do lightbox (apenas se houver >1 imagem) */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); lightboxNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Ações do lightbox */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handleSetAsProfile(allImages[lightboxIndex!])}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${allImages[lightboxIndex!] === profileImageUrl
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-white/10'
                }`}
            >
              <Star size={12} />
              {allImages[lightboxIndex!] === profileImageUrl ? 'Imagem de Perfil' : 'Definir como Perfil'}
            </button>
            <span className="text-zinc-500 text-xs">
              {lightboxIndex + 1} / {allImages.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery
