"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Share2,
  Download,
  Copy,
  FileText,
  Table,
  Link,
  Mail,
  MessageSquare,
  CheckCircle,
  ShoppingCart,
  Shield,
} from "lucide-react"
import type { MealPlan } from "@/types/meal-planning"
import {
  exportAsText,
  exportAsCSV,
  exportShoppingListAsText,
  exportAsMPFile,
  downloadFile,
  copyToClipboard,
  generateShareableLink,
  generateMealPlanSummary,
} from "@/lib/export-utils"

interface MealPlanExportProps {
  mealPlan: MealPlan
}

export default function MealPlanExport({ mealPlan }: MealPlanExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [shareableLink, setShareableLink] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  const handleCopy = async (content: string, itemName: string) => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopiedItem(itemName)
      setTimeout(() => setCopiedItem(null), 2000)
    }
  }

  const handleDownload = (format: "text" | "csv" | "shopping" | "mp") => {
    const weekOf = new Date(mealPlan.weekOf).toLocaleDateString().replace(/\//g, "-")

    switch (format) {
      case "text":
        const textContent = exportAsText(mealPlan)
        downloadFile(textContent, `meal-plan-${weekOf}.txt`, "text/plain")
        break
      case "csv":
        const csvContent = exportAsCSV(mealPlan)
        downloadFile(csvContent, `meal-plan-${weekOf}.csv`, "text/csv")
        break
      case "shopping":
        const shoppingContent = exportShoppingListAsText(mealPlan)
        downloadFile(shoppingContent, `shopping-list-${weekOf}.txt`, "text/plain")
        break
      case "mp":
        exportAsMPFile(mealPlan)
        break
    }
  }

  const generateLink = () => {
    const link = generateShareableLink(mealPlan)
    setShareableLink(link)
    return link
  }

  const shareViaEmail = () => {
    const summary = generateMealPlanSummary(mealPlan)
    const subject = `Meal Plan - Week of ${new Date(mealPlan.weekOf).toLocaleDateString()}`
    const body = customMessage ? `${customMessage}\n\n${summary}` : summary
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const shareViaWhatsApp = () => {
    const summary = generateMealPlanSummary(mealPlan)
    const message = customMessage ? `${customMessage}\n\n${summary}` : summary
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, "_blank")
  }

  const shareViaText = () => {
    const summary = generateMealPlanSummary(mealPlan)
    const message = customMessage ? `${customMessage}\n\n${summary}` : summary
    const smsLink = `sms:?body=${encodeURIComponent(message)}`
    window.open(smsLink)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Export & Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Export & Share Meal Plan
          </DialogTitle>
          <DialogDescription>
            Share your meal plan with family and friends or export it for your records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Fast ways to share or save your meal plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(generateMealPlanSummary(mealPlan), "summary")}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  {copiedItem === "summary" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                  <span className="text-sm">Copy Summary</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleCopy(generateShareableLink(mealPlan), "link")}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  {copiedItem === "link" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Link className="h-5 w-5" />
                  )}
                  <span className="text-sm">Copy Link</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleDownload("mp")}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Download .mp</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={shareViaEmail}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Personal Message</CardTitle>
              <CardDescription>Include a custom message when sharing</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Here's our family meal plan for this week! Let me know what you think..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Download Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Options
              </CardTitle>
              <CardDescription>Save your meal plan in different formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Encrypted .mp</span>
                  </div>
                  <p className="text-sm text-gray-600">Secure encrypted format for sharing meal plans</p>
                  <Button onClick={() => handleDownload("mp")} variant="outline" className="w-full">
                    Download as .mp
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Text Format</span>
                  </div>
                  <p className="text-sm text-gray-600">Human-readable format with meal times</p>
                  <Button onClick={() => handleDownload("text")} variant="outline" className="w-full">
                    Download as Text
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    <span className="font-medium">CSV Format</span>
                  </div>
                  <p className="text-sm text-gray-600">Spreadsheet format with meal times</p>
                  <Button onClick={() => handleDownload("csv")} variant="outline" className="w-full">
                    Download as CSV
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium">Shopping List</span>
                  </div>
                  <p className="text-sm text-gray-600">Organized shopping list by categories</p>
                  <Button onClick={() => handleDownload("shopping")} variant="outline" className="w-full">
                    Download Shopping List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share via Apps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share via Apps</CardTitle>
              <CardDescription>Share directly through your favorite apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={shareViaEmail} variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>

                <Button onClick={shareViaWhatsApp} variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </Button>

                <Button onClick={shareViaText} variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Text Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shareable Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="h-5 w-5" />
                Shareable Link
              </CardTitle>
              <CardDescription>Generate a link that others can use to view your meal plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={shareableLink || "Click 'Generate Link' to create a shareable URL"}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <Button onClick={generateLink} variant="outline">
                  Generate Link
                </Button>
                {shareableLink && (
                  <Button onClick={() => handleCopy(shareableLink, "generated-link")} variant="outline" size="icon">
                    {copiedItem === "generated-link" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {shareableLink && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Link generated! Anyone with this link can view your meal plan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Copy Confirmations */}
          {copiedItem && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {copiedItem === "summary" && "Meal plan summary copied to clipboard!"}
                {copiedItem === "link" && "Shareable link copied to clipboard!"}
                {copiedItem === "generated-link" && "Generated link copied to clipboard!"}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
