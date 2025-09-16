"use client"

import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ShieldExclamationIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldExclamationIcon className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this resource. Please contact your administrator if you believe this is
            an error.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default Unauthorized
