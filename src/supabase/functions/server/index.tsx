import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger(console.log))

// Supabase client with service role for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )
}

// Utility to verify access token
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  const supabase = getSupabaseAdmin()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return user
  } catch {
    return null
  }
}

// Initialize default admin user
app.get('/make-server-9501e66e/init', async (c) => {
  try {
    // Check if admin already exists
    const existingAdmin = await kv.get('admin_user')
    if (existingAdmin) {
      return c.json({ message: 'Admin already exists', admin: existingAdmin })
    }

    // Create default admin user
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@mhimmo.com',
      password: 'admin123',
      user_metadata: { 
        name: 'Propriétaire Admin',
        role: 'proprietaire'
      },
      email_confirm: true
    })

    if (error) {
      console.log('Error creating admin user:', error)
      return c.json({ error: 'Failed to create admin user' }, 500)
    }

    // Store admin info in KV
    const adminData = {
      id: data.user.id,
      email: data.user.email,
      name: 'Propriétaire Admin',
      role: 'proprietaire',
      created_at: new Date().toISOString()
    }

    await kv.set('admin_user', adminData)
    await kv.set(`user_${data.user.id}`, adminData)

    return c.json({ 
      message: 'Admin user created successfully',
      admin: adminData,
      credentials: {
        email: 'admin@mhimmo.com',
        password: 'admin123'
      }
    })
  } catch (error) {
    console.log('Init error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Auth routes
app.post('/make-server-9501e66e/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Get user data from KV
    const userData = await kv.get(`user_${data.user.id}`)
    
    return c.json({
      user: userData || {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'locataire'
      },
      session: data.session
    })
  } catch (error) {
    console.log('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// User management routes
app.post('/make-server-9501e66e/users', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userData = await kv.get(`user_${user.id}`)
    if (!userData || userData.role !== 'proprietaire') {
      return c.json({ error: 'Only proprietaire can create users' }, 403)
    }

    const { email, password, name, role } = await c.req.json()
    
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    })

    if (error) {
      return c.json({ error: 'Failed to create user' }, 400)
    }

    const newUserData = {
      id: data.user.id,
      email: data.user.email,
      name,
      role,
      created_by: user.id,
      created_at: new Date().toISOString()
    }

    await kv.set(`user_${data.user.id}`, newUserData)

    return c.json({ user: newUserData })
  } catch (error) {
    console.log('Create user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get all users (for proprietaire and gestionnaire)
app.get('/make-server-9501e66e/users', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userData = await kv.get(`user_${user.id}`)
    if (!userData || !['proprietaire', 'gestionnaire'].includes(userData.role)) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const userPrefix = await kv.getByPrefix('user_')
    const users = userPrefix.filter(item => item.value.id !== user.id)

    return c.json({ users: users.map(item => item.value) })
  } catch (error) {
    console.log('Get users error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Property management routes
app.post('/make-server-9501e66e/properties', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userData = await kv.get(`user_${user.id}`)
    if (!userData || !['proprietaire', 'gestionnaire'].includes(userData.role)) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const propertyData = await c.req.json()
    const propertyId = crypto.randomUUID()
    
    const property = {
      id: propertyId,
      ...propertyData,
      status: 'inoccupe',
      created_by: user.id,
      created_at: new Date().toISOString()
    }

    await kv.set(`property_${propertyId}`, property)

    return c.json({ property })
  } catch (error) {
    console.log('Create property error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get all properties
app.get('/make-server-9501e66e/properties', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const properties = await kv.getByPrefix('property_')
    return c.json({ properties: properties.map(item => item.value) })
  } catch (error) {
    console.log('Get properties error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Contract management
app.post('/make-server-9501e66e/contracts', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const contractData = await c.req.json()
    const contractId = crypto.randomUUID()
    
    const contract = {
      id: contractId,
      ...contractData,
      created_by: user.id,
      created_at: new Date().toISOString()
    }

    await kv.set(`contract_${contractId}`, contract)

    // Update property status to occupied
    if (contractData.property_id) {
      const property = await kv.get(`property_${contractData.property_id}`)
      if (property) {
        property.status = 'occupe'
        property.tenant_id = contractData.tenant_id
        await kv.set(`property_${contractData.property_id}`, property)
      }
    }

    return c.json({ contract })
  } catch (error) {
    console.log('Create contract error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get contracts
app.get('/make-server-9501e66e/contracts', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const contracts = await kv.getByPrefix('contract_')
    return c.json({ contracts: contracts.map(item => item.value) })
  } catch (error) {
    console.log('Get contracts error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Messages routes
app.post('/make-server-9501e66e/messages', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { recipient_id, content, type = 'text' } = await c.req.json()
    const messageId = crypto.randomUUID()
    
    const message = {
      id: messageId,
      sender_id: user.id,
      recipient_id,
      content,
      type,
      created_at: new Date().toISOString(),
      read: false
    }

    await kv.set(`message_${messageId}`, message)

    return c.json({ message })
  } catch (error) {
    console.log('Send message error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get messages between users
app.get('/make-server-9501e66e/messages/:userId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = c.req.param('userId')
    const allMessages = await kv.getByPrefix('message_')
    
    const messages = allMessages
      .map(item => item.value)
      .filter(msg => 
        (msg.sender_id === user.id && msg.recipient_id === userId) ||
        (msg.sender_id === userId && msg.recipient_id === user.id)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return c.json({ messages })
  } catch (error) {
    console.log('Get messages error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Health check
app.get('/make-server-9501e66e/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

Deno.serve(app.fetch)