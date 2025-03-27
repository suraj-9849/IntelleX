import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WatchTabProps {
  watchUrl?: string
}

export const WatchTab: React.FC<WatchTabProps> = ({ watchUrl }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Robot Tracking</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100vh-150px)]">
        {watchUrl ? (
          <iframe
            src={watchUrl}
            className="h-full w-full rounded-lg border-2 border-gray-300 shadow-lg"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Enter an IP address in the Analyze tab first
          </div>
        )}
      </CardContent>
    </Card>
  )
}