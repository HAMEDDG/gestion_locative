import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Home, 
  Plus, 
  Search, 
  MapPin, 
  Euro, 
  Grid3X3,
  List,
  Filter,
  Edit,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

export const PropertiesManager: React.FC = () => {
  const { user } = useAuth()
  const { properties, addProperty } = useData()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupe' | 'inoccupe'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postal_code: '',
    type: 'appartement',
    price: '',
    deposit: '',
    surface: '',
    rooms: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const propertyData = {
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        type: formData.type,
        price: parseFloat(formData.price),
        deposit: parseFloat(formData.deposit),
        surface: parseFloat(formData.surface),
        rooms: parseInt(formData.rooms),
        description: formData.description
      }

      addProperty(propertyData)
      toast.success('Bien ajouté avec succès')
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error adding property:', error)
      toast.error('Erreur lors de l\'ajout du bien')
    }
  }

  const resetForm = () => {
    setFormData({
      address: '',
      city: '',
      postal_code: '',
      type: 'appartement',
      price: '',
      deposit: '',
      surface: '',
      rooms: '',
      description: ''
    })
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    return status === 'occupe' ? (
      <Badge variant="destructive">Occupé</Badge>
    ) : (
      <Badge variant="secondary">Disponible</Badge>
    )
  }

  const PropertyCard = ({ property }: { property: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}, {property.city}
            </CardDescription>
          </div>
          {getStatusBadge(property.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Loyer</span>
            <span className="flex items-center">
              <Euro className="h-4 w-4 mr-1" />
              {property.price.toLocaleString()}€/mois
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Surface</span>
            <span>{property.surface}m²</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pièces</span>
            <span>{property.rooms} pièces</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Caution</span>
            <span>{property.deposit.toLocaleString()}€</span>
          </div>
        </div>
        
        {user?.role === 'proprietaire' && (
          <div className="flex space-x-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl text-gray-900 dark:text-white">
            {user?.role === 'proprietaire' ? 'Gestion des biens' : 'Biens assignés'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredProperties.length} bien(s) trouvé(s)
          </p>
        </div>
        
        {user?.role === 'proprietaire' && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un bien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau bien</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du bien immobilier
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Rue de la Paix"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Paris"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                      placeholder="75001"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de bien</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appartement">Appartement</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="loft">Loft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Loyer mensuel (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="950"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Caution (€)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, deposit: e.target.value }))}
                      placeholder="1900"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <Input
                      id="surface"
                      type="number"
                      value={formData.surface}
                      onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                      placeholder="45"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Nombre de pièces</Label>
                    <Input
                      id="rooms"
                      type="number"
                      value={formData.rooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: e.target.value }))}
                      placeholder="3"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du bien..."
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Ajouter le bien
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par adresse ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les biens</SelectItem>
            <SelectItem value="inoccupe">Disponibles</SelectItem>
            <SelectItem value="occupe">Occupés</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 dark:text-white mb-2">
              Aucun bien trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucun bien ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier bien immobilier.'
              }
            </p>
            {user?.role === 'proprietaire' && !searchTerm && filterStatus === 'all' && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un bien
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}