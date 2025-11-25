import { useState } from "react";
import { Button } from "@/components/Button";
import { X, Plus, Trash2 } from "lucide-react";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
    categories: Category[];
    onAdd: (category: Omit<Category, 'id'>) => void;
    onDelete: (categoryId: string) => void;
    onClose: () => void;
}

const PRESET_ICONS = ["🍔", "🚕", "🛍️", "🎬", "✈️", "📝", "🏠", "💡", "💊", "🏋️", "📚", "🎮", "🎵", "🔧", "🎁", "👶", "🐶", "💻", "🎨", "🍷"];

export function CategoryManager({ categories, onAdd, onDelete, onClose }: CategoryManagerProps) {
    const [newLabel, setNewLabel] = useState("");
    const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLabel.trim()) return;

        onAdd({
            label: newLabel.trim(),
            icon: selectedIcon
        });
        setNewLabel("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-white/10">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold uppercase tracking-widest text-orange-500">Manage Categories</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Add New Category */}
                    <form onSubmit={handleAdd} className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Add New Category</h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="Category Name"
                                    className="flex-1 h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent transition-all"
                                />
                                <div className="h-12 w-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-2xl">
                                    {selectedIcon}
                                </div>
                            </div>

                            {/* Icon Selection */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {PRESET_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setSelectedIcon(icon)}
                                        className={cn(
                                            "h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl transition-all",
                                            selectedIcon === icon
                                                ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg scale-110"
                                                : "bg-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-lg shadow-orange-500/20 font-bold">
                                <Plus className="mr-2 h-5 w-5" />
                                Add Category
                            </Button>
                        </div>
                    </form>

                    {/* Existing Categories */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Existing Categories</h3>
                        <div className="grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="font-medium">{cat.label}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(cat.id)}
                                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
