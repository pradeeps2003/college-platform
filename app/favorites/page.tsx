'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Resource, ResourceCard } from '@/components/resource-card'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function FavoritesPage() {
    const { user } = useAuth()
    const [favorites, setFavorites] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadFavorites() {
            if (!user) return

            // Join favorites with resources
            const { data, error } = await supabase
                .from('favorites')
                .select(`
          resource_id,
          resources:resource_id (
            *,
            profiles:uploaded_by (full_name)
          )
        `)
                .eq('user_id', user.id)

            if (data) {
                // Flatten structure
                const resources = data.map((item: any) => item.resources) as unknown as Resource[]
                setFavorites(resources)
            }
            setLoading(false)
        }

        loadFavorites()
    }, [user])

    return (
        <div className="container py-10">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

            {loading ? (
                <div>Loading...</div>
            ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {favorites.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">You haven&apos;t favorited any resources yet.</p>
                </div>
            )}
        </div>
    )
}
