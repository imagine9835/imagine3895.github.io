import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  adminVerify,
  createPhoto,
  deletePhoto,
  fetchPhotos,
  updatePhoto,
  CATEGORIES,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Trash2, LogOut, Plus, ArrowLeft } from "lucide-react";

const KEY_STORAGE = "ffn_admin_key";

function LoginScreen({ onLoggedIn }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminVerify(key);
      localStorage.setItem(KEY_STORAGE, key);
      toast.success("Welcome back, Nai");
      onLoggedIn(key);
    } catch {
      toast.error("Invalid admin key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] px-6">
      <form
        onSubmit={submit}
        data-testid="admin-login-form"
        className="w-full max-w-md border border-white/10 p-10"
      >
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-4">
          Admin / studio
        </div>
        <h1 className="font-serif text-4xl tracking-tight">Sign in</h1>
        <p className="text-sm text-[#a1a1aa] mt-2">
          Enter the admin key to manage the archive.
        </p>
        <div className="mt-8 space-y-2">
          <Label className="text-xs uppercase tracking-[0.2em]">Admin key</Label>
          <Input
            data-testid="admin-key-input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="••••••••"
            className="bg-transparent border-white/15 focus:border-white/40"
          />
        </div>
        <Button
          type="submit"
          data-testid="admin-login-submit"
          disabled={loading}
          className="mt-8 w-full bg-[#f5f5f0] text-[#0a0a0c] hover:bg-white"
        >
          {loading ? "Verifying…" : "Enter"}
        </Button>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#a1a1aa] hover:text-[#f5f5f0]"
          data-testid="admin-back-home"
        >
          <ArrowLeft className="w-3 h-3" /> Back to site
        </Link>
      </form>
    </div>
  );
}

function UploadDialog({ open, onOpenChange, adminKey, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    caption: "",
    category: "portrait",
    image_url: "",
    featured: false,
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image_url) return toast.error("Provide an image URL or upload");
    setSubmitting(true);
    try {
      await createPhoto(adminKey, form);
      toast.success("Photo added");
      onCreated();
      onOpenChange(false);
      setForm({ title: "", caption: "", category: "portrait", image_url: "", featured: false, order: 0 });
    } catch {
      toast.error("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0c] border-white/10 text-[#f5f5f0] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add to archive</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" data-testid="upload-form">
          <div>
            <Label className="text-xs uppercase tracking-[0.2em]">Title</Label>
            <Input
              data-testid="upload-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-transparent border-white/15 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.2em]">Caption</Label>
            <Textarea
              data-testid="upload-caption"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="bg-transparent border-white/15 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-[0.2em]">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger
                  data-testid="upload-category"
                  className="bg-transparent border-white/15 mt-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0c] border-white/10 text-[#f5f5f0]">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em]">Order</Label>
              <Input
                data-testid="upload-order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value || "0", 10) })}
                className="bg-transparent border-white/15 mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.2em]">Image URL</Label>
            <Input
              data-testid="upload-image-url"
              value={form.image_url.startsWith("data:") ? "(uploaded file)" : form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://…"
              className="bg-transparent border-white/15 mt-1"
            />
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] mt-2">
              or upload a file (≤5MB)
            </div>
            <Input
              data-testid="upload-image-file"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="bg-transparent border-white/15 mt-1 file:text-[#f5f5f0]"
            />
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <Label className="text-xs uppercase tracking-[0.2em]">Featured on home</Label>
            <Switch
              data-testid="upload-featured"
              checked={form.featured}
              onCheckedChange={(v) => setForm({ ...form, featured: v })}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              data-testid="upload-submit"
              disabled={submitting}
              className="bg-[#f5f5f0] text-[#0a0a0c] hover:bg-white"
            >
              {submitting ? "Saving…" : "Save photo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard({ adminKey, onLogout }) {
  const [photos, setPhotos] = useState([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = () => {
    fetchPhotos(filter === "all" ? {} : { category: filter }).then(setPhotos);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const remove = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await deletePhoto(adminKey, id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleFeatured = async (p) => {
    try {
      await updatePhoto(adminKey, p.id, { featured: !p.featured });
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f5f0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-2">
              Studio dashboard
            </div>
            <h1 className="font-serif text-4xl tracking-tight">The archive</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              data-testid="dashboard-view-site"
              className="text-xs uppercase tracking-[0.3em] link-underline text-[#a1a1aa] hover:text-[#f5f5f0]"
            >
              View site
            </Link>
            <Button
              data-testid="dashboard-add-photo"
              onClick={() => setOpenUpload(true)}
              className="bg-[#f5f5f0] text-[#0a0a0c] hover:bg-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add photo
            </Button>
            <Button
              data-testid="dashboard-logout"
              variant="outline"
              onClick={onLogout}
              className="border-white/15 bg-transparent hover:bg-white/5"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.2em] border-y border-white/10 py-4 mb-8">
          {[{ key: "all", label: "All" }, ...CATEGORIES].map((c) => (
            <button
              key={c.key}
              data-testid={`dashboard-filter-${c.key}`}
              onClick={() => setFilter(c.key)}
              className={`link-underline ${
                filter === c.key ? "text-[#f5f5f0] active" : "text-[#a1a1aa]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div
              key={p.id}
              data-testid={`dashboard-photo-${p.id}`}
              className="border border-white/10 group"
            >
              <div className="aspect-square overflow-hidden bg-[#121216]">
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 text-xs">
                <div className="font-serif text-base truncate">{p.title || "Untitled"}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] mt-1">
                  {p.category}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#a1a1aa] cursor-pointer">
                    <Switch
                      checked={p.featured}
                      onCheckedChange={() => toggleFeatured(p)}
                      data-testid={`toggle-featured-${p.id}`}
                    />
                    Featured
                  </label>
                  <button
                    data-testid={`delete-photo-${p.id}`}
                    onClick={() => remove(p.id)}
                    className="text-[#a1a1aa] hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="py-24 text-center text-[#a1a1aa]" data-testid="dashboard-empty">
            No photos yet. Add your first frame.
          </div>
        )}
      </div>

      <UploadDialog
        open={openUpload}
        onOpenChange={setOpenUpload}
        adminKey={adminKey}
        onCreated={load}
      />
    </div>
  );
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY_STORAGE);
    if (stored) {
      adminVerify(stored)
        .then(() => setAdminKey(stored))
        .catch(() => localStorage.removeItem(KEY_STORAGE));
    }
  }, []);

  if (!adminKey) return <LoginScreen onLoggedIn={setAdminKey} />;
  return (
    <Dashboard
      adminKey={adminKey}
      onLogout={() => {
        localStorage.removeItem(KEY_STORAGE);
        setAdminKey(null);
      }}
    />
  );
}
