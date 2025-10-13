import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { useToast } from "../components/ui/use-toast"
import { apiService } from "../services/api"
import useOptions from "../hooks/useOptions"

const emptyArticle = {
  title: "",
  summary: "",
  content: "",
  category: null,
}

const KnowledgeBaseAdmin = () => {
  const { toast } = useToast()
  const [articles, setArticles] = useState([])
  const { options: categories } = useOptions('/knowledge-base/categories/', (c) => ({ value: c.id || c.name, label: c.name }), [/* once */])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [articleForm, setArticleForm] = useState(emptyArticle)
  const [editingArticle, setEditingArticle] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const articleRes = await apiService.getKnowledgeBaseArticles()
      setArticles(articleRes.data.results || articleRes.data)
    } catch (error) {
      console.error("Failed to load knowledge base data", error)
      toast({
        title: "Failed to load knowledge base",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLowerCase()
    return articles.filter((article) => {
      const matchesSearch = term
        ? [article.title, article.summary, article.content]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(term))
        : true
      const matchesCategory = categoryFilter === "all" || `${article.category}` === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [articles, search, categoryFilter])

  const openCreateDialog = () => {
    setEditingArticle(null)
    setArticleForm(emptyArticle)
    setDialogOpen(true)
  }

  const openEditDialog = (article) => {
    setEditingArticle(article)
    setArticleForm({
      title: article.title || "",
      summary: article.summary || "",
      content: article.content || "",
      category: article.category || null,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (article) => {
    const confirmed = window.confirm(`Delete article "${article.title}"?`)
    if (!confirmed) return

    try {
      await apiService.deleteKnowledgeBaseArticle(article.id)
      toast({ title: "Article deleted" })
      setArticles((prev) => prev.filter((item) => item.id !== article.id))
    } catch (error) {
      console.error("Failed to delete article", error)
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      ...articleForm,
      category: articleForm.category || null,
    }

    try {
      if (editingArticle) {
        const res = await apiService.updateKnowledgeBaseArticle(editingArticle.id, payload)
        setArticles((prev) => prev.map((article) => (article.id === editingArticle.id ? res.data : article)))
        toast({ title: "Article updated" })
      } else {
        const res = await apiService.createKnowledgeBaseArticle(payload)
        setArticles((prev) => [res.data, ...prev])
        toast({ title: "Article created" })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save article", error)
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base Admin</h1>
          <p className="text-muted-foreground">Create and maintain support documentation for the organization.</p>
        </div>
        <Button onClick={openCreateDialog}>New Article</Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search by title, summary, or content"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id || category.name} value={`${category.id || category.name}`}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading articles..." : `${filteredArticles.length} of ${articles.length} articles`}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="border">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">{article.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openEditDialog(article)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(article)}>
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {article.category_display && (
                  <Badge variant="secondary">{article.category_display || article.category_name}</Badge>
                )}
                {article.author_name && <span>Author: {article.author_name}</span>}
                {article.updated_at && <span>Updated: {new Date(article.updated_at).toLocaleString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {!filteredArticles.length && !loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No articles found.</CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  required
                  value={articleForm.title}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Textarea
                  required
                  value={articleForm.summary}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, summary: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={articleForm.category ? `${articleForm.category}` : ""}
                  onValueChange={(value) =>
                    setArticleForm((prev) => ({ ...prev, category: value ? Number(value) : null }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id || category.name} value={`${category.id || category.name}`}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  className="min-h-[200px]"
                  required
                  value={articleForm.content}
                  onChange={(event) => setArticleForm((prev) => ({ ...prev, content: event.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KnowledgeBaseAdmin
