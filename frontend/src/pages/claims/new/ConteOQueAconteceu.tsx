import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BackButton } from '@/components/BackButton'
import { FormStepper } from '@/components/FormStepper'
import { useClaimFormStore } from '@/stores/claim'
import { uploadImages } from '@/services/claims'
import { useToast } from '@/hooks/use-toast'

const STEPS = ['Sobre você', 'Seu voo', 'O que aconteceu', 'Revisão']
const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024

const conteSchema = z.object({
  damageDescription: z
    .string()
    .min(20, 'Descreva o dano com mais detalhes (mínimo 20 caracteres)')
    .max(2000, 'Descrição muito longa'),
  baggageContents: z
    .string()
    .min(10, 'Informe o conteúdo da bagagem (mínimo 10 caracteres)')
    .max(1000, 'Descrição muito longa'),
})

type ConteFormData = z.infer<typeof conteSchema>

interface PreviewImage {
  file: File
  preview: string
}

export default function ConteOQueAconteceu() {
  const navigate = useNavigate()
  const { formData, updateFormData } = useClaimFormStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<PreviewImage[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConteFormData>({
    resolver: zodResolver(conteSchema),
    defaultValues: {
      damageDescription: formData.damageDescription,
      baggageContents: formData.baggageContents,
    },
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > MAX_FILES) {
      toast({
        variant: 'destructive',
        title: 'Limite excedido',
        description: `Máximo de ${MAX_FILES} imagens permitidas.`,
      })
      return
    }

    const validFiles: PreviewImage[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `${file.name} excede 5MB. Será comprimido.`,
        })
      }

      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })

        validFiles.push({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
        })
      } catch {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: `Não foi possível processar ${file.name}.`,
        })
      }
    }

    setImages((prev) => [...prev, ...validFiles])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const onSubmit = async (data: ConteFormData) => {
    if (images.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Imagem obrigatória',
        description: 'Anexe pelo menos uma imagem do dano.',
      })
      return
    }

    setIsUploading(true)

    try {
      const files = images.map((img) => img.file)
      const { urls } = await uploadImages(files)

      updateFormData({
        ...data,
        images: urls,
      })

      navigate('/claims/new/review')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Não foi possível enviar as imagens. Tente novamente.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12 pb-24">
      <BackButton to="/claims/new/step-2" />

      <div className="mt-12">
        <FormStepper currentStep={3} steps={STEPS} />

        <h1 className="mb-6 text-2xl font-bold text-neutral-900">
          Conte o que aconteceu
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="damageDescription">Descreva o dano</Label>
            <Textarea
              id="damageDescription"
              placeholder="Descreva detalhadamente o dano ocorrido na sua bagagem..."
              error={!!errors.damageDescription}
              {...register('damageDescription')}
            />
            {errors.damageDescription && (
              <span className="text-sm text-error">
                {errors.damageDescription.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="baggageContents">Conteúdo da Bagagem</Label>
            <Textarea
              id="baggageContents"
              placeholder="Liste os itens que estavam na bagagem..."
              error={!!errors.baggageContents}
              {...register('baggageContents')}
            />
            {errors.baggageContents && (
              <span className="text-sm text-error">
                {errors.baggageContents.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Fotos do dano ({images.length}/{MAX_FILES})
            </Label>

            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => {
                const imageKey = `image-${image.preview.slice(-20)}`
                return (
                  <div key={imageKey} className="relative aspect-square">
                    <img
                      src={image.preview}
                      alt={`Imagem ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-error p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}

              {images.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary"
                >
                  <Camera className="h-8 w-8 text-neutral-400" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <span className="text-xs text-neutral-500">
              Anexe de 1 a 5 imagens (máx. 5MB cada)
            </span>
          </div>

          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={isUploading}
          >
            {isUploading ? 'Enviando imagens...' : 'Avançar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
