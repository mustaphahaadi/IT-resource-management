import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import { Separator } from "../components/ui/separator"
import { apiService } from "../services/api"

const KnowledgeBaseArticle = () => {
  const { articleId } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await apiService.getKnowledgeBaseArticle(articleId)
        setArticle(response.data)
      } catch (err) {
        console.error("Failed to fetch knowledge base article", err)
        setError("Unable to load the selected knowledge base article.")
      } finally {
        setLoading(false)
      }
    }

    if (articleId) {
      fetchArticle()
    }
  }, [articleId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link to="/app/knowledge-base">Back to Knowledge Base</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!article) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-muted-foreground">Article not found.</p>
          <Button asChild variant="outline">
            <Link to="/app/knowledge-base">Back to Knowledge Base</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {article.category_name && <Badge variant="secondary">{article.category_name}</Badge>}
            {article.author_name && <span>Author: {article.author_name}</span>}
            {article.updated_at && (
              <span>Updated: {new Date(article.updated_at).toLocaleString()}</span>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/knowledge-base">Back to Knowledge Base</Link>
        </Button>
      </div>

      {article.summary && (
        <Card>
          <CardContent className="text-muted-foreground">{article.summary}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="prose max-w-none whitespace-pre-wrap">
            {article.content}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default KnowledgeBaseArticle
