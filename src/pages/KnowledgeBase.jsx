import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { apiService } from "../services/api"

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError("")
        const res = await apiService.getKnowledgeBaseArticles({ search: searchTerm })
        setArticles(res.data.results || res.data)
      } catch (err) {
        console.error("Error fetching articles", err)
        setError("Unable to load knowledge base articles.")
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Browse troubleshooting guides, FAQs, and best practices.</p>
        </div>
      </div>

      <Input
        type="text"
        placeholder="Search by title, summary, or content keywords"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="py-6 text-center text-destructive">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {article.category_display && (
                    <Badge variant="secondary">{article.category_display}</Badge>
                  )}
                  {article.author_name && <span>Author: {article.author_name}</span>}
                  {article.updated_at && (
                    <span>Updated: {new Date(article.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
                <div className="mt-auto">
                  <Link
                    to={`/app/knowledge-base/${article.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Read article
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {!articles.length && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No knowledge base articles found.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default KnowledgeBase
