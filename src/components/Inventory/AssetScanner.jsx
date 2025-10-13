import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { 
  QrCodeIcon, 
  XMarkIcon, 
  CameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"

const AssetScanner = ({ onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setError("")
      setIsScanning(true)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      setError("Camera access denied or not available")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    // Convert canvas to blob and send to backend for processing
    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData()
        formData.append('image', blob, 'scan.jpg')
        
        // For now, we'll simulate QR code scanning
        // In a real implementation, you'd use a QR code library like jsQR
        setError("QR code scanning requires additional setup. Please use manual input.")
      } catch (err) {
        setError("Failed to process scan")
      }
    }, 'image/jpeg', 0.8)
  }

  const handleManualScan = async () => {
    if (!manualInput.trim()) {
      setError("Please enter an asset tag, barcode, or RFID")
      return
    }

    try {
      setError("")
      const response = await apiService.scanEquipment({
        scan_data: manualInput.trim(),
        scan_type: 'manual'
      })
      
      setScanResult(response.data)
      if (onScanSuccess) {
        onScanSuccess(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || "Equipment not found")
    }
  }

  const handleScanAnother = () => {
    setScanResult(null)
    setManualInput("")
    setError("")
  }

  if (scanResult) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <CardTitle>Equipment Found</CardTitle>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">{scanResult.name}</h3>
              <p className="text-sm text-green-700">Asset Tag: {scanResult.asset_tag}</p>
              <p className="text-sm text-green-700">Status: {scanResult.status}</p>
              <p className="text-sm text-green-700">Location: {scanResult.location_name}</p>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleScanAnother} variant="outline" className="flex-1">
                Scan Another
              </Button>
              <Button onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCodeIcon className="w-6 h-6 text-blue-600" />
            <CardTitle>Asset Scanner</CardTitle>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!showManualInput ? (
            <div className="space-y-4">
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={captureAndScan} className="flex-1">
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                    <Button onClick={stopCamera} variant="outline" className="flex-1">
                      Stop
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Scan QR codes, barcodes, or RFID tags to quickly find equipment
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button onClick={startCamera} className="w-full">
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                    <Button 
                      onClick={() => setShowManualInput(true)} 
                      variant="outline" 
                      className="w-full"
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Manual Input
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Tag, Barcode, or RFID
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter asset identifier..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleManualScan} className="flex-1">
                  Search
                </Button>
                <Button 
                  onClick={() => setShowManualInput(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AssetScanner
