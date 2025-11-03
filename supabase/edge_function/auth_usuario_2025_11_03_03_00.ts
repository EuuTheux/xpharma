import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { usuario, senha } = await req.json()

    if (!usuario || !senha) {
      return new Response(
        JSON.stringify({ error: 'Usuário e senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar usuário no banco
    const { data: usuarioData, error } = await supabaseClient
      .from('usuarios_sistema_2025_11_03_03_00')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .eq('ativo', true)
      .single()

    if (error || !usuarioData) {
      return new Response(
        JSON.stringify({ error: 'Usuário ou senha inválidos' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Retornar dados do usuário (sem a senha)
    const { senha: _, ...usuarioSemSenha } = usuarioData

    return new Response(
      JSON.stringify({ 
        success: true, 
        usuario: usuarioSemSenha,
        message: 'Login realizado com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})