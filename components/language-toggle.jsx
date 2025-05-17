"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const [language, setLanguage] = useState("en")

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "jp" : "en"))
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="border-[#dce4d7] bg-white text-[#2c3e2d] hover:bg-[#eef2eb]"
    >
      {language === "en" ? "EN" : "JP"}
    </Button>
  )
}
