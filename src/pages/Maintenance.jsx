import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const Maintenance = () => {
  const [maintenanceInfo, setMaintenanceInfo] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)

  useEffect(() => {
    // Get maintenance info from URL params or API
    const urlParams = new URLSearchParams(window.location.search)
    const reason = urlParams.get('reason') || 'scheduled'
    const duration = urlParams.get('duration') || '2 hours'
    const startTime = urlParams.get('start') || new Date().toISOString()
    const emergency = urlParams.get('emergency') === 'true'

    setMaintenanceInfo({
      reason,
      duration,
      startTime,
      estimatedEnd: new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString()
    })
    setIsEmergency(emergency)

    // Update countdown timer
    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date(Date.now() + (2 * 60 * 60 * 1000))
      const diff = end - now

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining('Maintenance should be complete')
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleEmergencyContact = () => {
    window.location.href = 'tel:+1-555-123-4567'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
            <WrenchScrewdriverIcon className="h-12 w-12 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Under Maintenance
          </h1>
          <p className="text-lg text-gray-600">
            We're currently performing {isEmergency ? 'emergency' : 'scheduled'} maintenance to improve your experience
          </p>
        </div>

        {/* Maintenance Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClockIcon className="w-6 h-6 text-blue-600" />
              <span>Maintenance Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-900">
                    {isEmergency ? 'Emergency Maintenance' : 'Scheduled Maintenance'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Estimated Duration</h3>
                <p className="text-sm text-gray-900">{maintenanceInfo?.duration}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Started</h3>
                <p className="text-sm text-gray-900">
                  {maintenanceInfo?.startTime ? 
                    new Date(maintenanceInfo.startTime).toLocaleString() : 
                    'Just now'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Time Remaining</h3>
                <p className="text-sm text-gray-900 font-medium">{timeRemaining}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">What we're working on:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {isEmergency ? (
                  <>
                    <li className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Resolving critical system issues</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Restoring full system functionality</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Database optimization and updates</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Security patches and improvements</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Performance enhancements</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ArrowPathIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
                      <span>System backup and verification</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Button onClick={handleRefresh} className="w-full sm:w-auto">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Check Status
          </Button>
          
          <p className="text-sm text-gray-500">
            This page will automatically refresh when maintenance is complete
          </p>
        </div>

        {/* Emergency Contact */}
        {isEmergency && (
          <Card className="mt-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Emergency Maintenance in Progress
                  </h3>
                  <p className="text-sm text-red-800 mb-4">
                    If this is a critical emergency affecting patient care, please contact our emergency support line immediately.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleEmergencyContact}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Emergency: (555) 123-4567
                    </Button>
                    <Button
                      onClick={() => window.location.href = 'mailto:emergency@hospital-it.com'}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      emergency@hospital-it.com
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">What happens during maintenance?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• The system will be temporarily unavailable</li>
                  <li>• All data is safely backed up before maintenance begins</li>
                  <li>• No data will be lost during this process</li>
                  <li>• You'll be automatically redirected when we're back online</li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>Status Page:</strong> For real-time updates, visit our{' '}
                    <a href="/status" className="text-blue-600 hover:text-blue-800 underline">
                      system status page
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Thank you for your patience. We'll be back online shortly.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Hospital IT Resource Management System
          </p>
        </div>
      </div>

      {/* Auto-refresh script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Auto-refresh every 30 seconds to check if maintenance is complete
            setTimeout(function() {
              fetch('/api/health')
                .then(response => {
                  if (response.ok) {
                    window.location.href = '/';
                  }
                })
                .catch(() => {
                  // Maintenance still ongoing, refresh page
                  setTimeout(() => window.location.reload(), 30000);
                });
            }, 30000);
          `
        }}
      />
    </div>
  )
}

export default Maintenance
