import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
	ComputerDesktopIcon,
	ExclamationTriangleIcon,
	ClipboardDocumentListIcon,
	WrenchScrewdriverIcon,
	UserIcon,
} from "@heroicons/react/24/outline"

const ActivityFeed = ({ activities = [], loading = false }) => {
	const getActivityIcon = (type) => {
		const icons = {
			equipment: ComputerDesktopIcon,
			request: ExclamationTriangleIcon,
			task: ClipboardDocumentListIcon,
			maintenance: WrenchScrewdriverIcon,
			user: UserIcon,
		}
		return icons[type] || ExclamationTriangleIcon
	}

	const getActivityColor = (type) => {
		const colors = {
			equipment: "text-blue-600",
			request: "text-red-600",
			task: "text-green-600",
			maintenance: "text-orange-600",
			user: "text-purple-600",
		}
		return colors[type] || "text-gray-600"
	}



	const formatTimeAgo = (timestamp) => {
		const now = new Date()
		const diff = now - new Date(timestamp)
		const minutes = Math.floor(diff / 60000)
		const hours = Math.floor(minutes / 60)
		const days = Math.floor(hours / 24)

		if (days > 0) return `${days}d ago`
		if (hours > 0) return `${hours}h ago`
		if (minutes > 0) return `${minutes}m ago`
		return "Just now"
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="flex items-center space-x-3 p-3">
								<div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted rounded animate-pulse" />
									<div className="h-3 bg-muted rounded animate-pulse w-3/4" />
								</div>
							</div>
						))}
					</div>
				) : activities.length === 0 ? (
					<div className="text-sm text-muted-foreground p-3">No recent activity</div>
				) : (
					<div className="space-y-3 max-h-96 overflow-y-auto">
						{activities.map((activity) => {
							const Icon = getActivityIcon(activity.type)
							return (
								<div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
									<Icon className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.type)}`} />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">{activity.title}</p>
										<p className="text-xs text-muted-foreground">{activity.description}</p>
										<div className="flex items-center justify-between mt-1">
											<span className="text-xs text-muted-foreground">{activity.user}</span>
											<span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default ActivityFeed
