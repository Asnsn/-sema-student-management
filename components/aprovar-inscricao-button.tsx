"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"

interface AprovarInscricaoButtonProps {
  inscricaoId: string
  modalidadeId: string
  action: "aprovar" | "rejeitar"
}

export function AprovarInscricaoButton({ inscricaoId, modalidadeId, action }: AprovarInscricaoButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (action === "aprovar") {
        // Update inscription status to active
        const { error: inscricaoError } = await supabase
          .from("inscricoes")
          .update({
            status: "ativo",
            data_aprovacao: new Date().toISOString(),
          })
          .eq("id", inscricaoId)

        if (inscricaoError) throw inscricaoError

        // Update modalidade vagas count
        const { data: modalidade } = await supabase
          .from("modalidades")
          .select("vagas_ocupadas")
          .eq("id", modalidadeId)
          .single()

        if (modalidade) {
          await supabase
            .from("modalidades")
            .update({ vagas_ocupadas: modalidade.vagas_ocupadas + 1 })
            .eq("id", modalidadeId)
        }
      } else {
        // Delete inscription (reject)
        const { error } = await supabase.from("inscricoes").delete().eq("id", inscricaoId)

        if (error) throw error
      }

      router.refresh()
    } catch (error) {
      console.error("Error processing inscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAction}
      disabled={isLoading}
      size="sm"
      variant={action === "aprovar" ? "default" : "destructive"}
      className="flex-1"
    >
      {action === "aprovar" ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1" />
          {isLoading ? "Aprovando..." : "Aprovar"}
        </>
      ) : (
        <>
          <X className="h-4 w-4 mr-1" />
          {isLoading ? "Rejeitando..." : "Rejeitar"}
        </>
      )}
    </Button>
  )
}
