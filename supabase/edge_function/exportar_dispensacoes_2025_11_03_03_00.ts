import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import ExcelJS from "https://cdn.jsdelivr.net/npm/exceljs@4.3.0/+esm";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const url = new URL(req.url);
    const dataInicio = url.searchParams.get('dataInicio');
    const dataFim = url.searchParams.get('dataFim');
    let query = supabaseClient.from('dispensacoes_2025_11_03_03_00').select(`
        *,
        pacientes_2025_11_03_03_00(nome, cpf),
        medicamentos_2025_11_03_03_00(nome, codigo, principio_ativo, concentracao)
      `).order('data_dispensacao', {
      ascending: false
    });
    if (dataInicio) query = query.gte('data_dispensacao', dataInicio);
    if (dataFim) query = query.lte('data_dispensacao', dataFim + 'T23:59:59');
    const { data: dispensacoes, error } = await query;
    if (error) {
      console.error(error);
      return new Response(JSON.stringify({
        error: 'Erro ao buscar dispensações'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Cria a planilha
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório de Dispensações');
    // Título grande na parte de cima
    worksheet.mergeCells('A1:J1');
    const titulo = worksheet.getCell('A1');
    titulo.value = 'Relatório de Dispensações de Medicamentos - ESF Maria Aúrea';
    titulo.font = {
      size: 16,
      bold: true,
      color: {
        argb: 'FFFFFFFF'
      }
    };
    titulo.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    titulo.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: '4F81BD'
      }
    };
    // Cabeçalhos
    const headerRow = [
      'Data da Dispensação',
      'Paciente',
      'CPF',
      'Medicamento',
      'Código',
      'Princípio Ativo',
      'Concentração',
      'Quantidade',
      'Usuário',
      'Observações'
    ];
    const header = worksheet.addRow(headerRow);
    header.eachCell((cell)=>{
      cell.font = {
        bold: true,
        color: {
          argb: 'FFFFFFFF'
        }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '4F81BD'
        }
      };
      cell.border = {
        top: {
          style: 'thin',
          color: {
            argb: '999999'
          }
        },
        left: {
          style: 'thin',
          color: {
            argb: '999999'
          }
        },
        bottom: {
          style: 'thin',
          color: {
            argb: '999999'
          }
        },
        right: {
          style: 'thin',
          color: {
            argb: '999999'
          }
        }
      };
    });
    // Dados
    dispensacoes.forEach((d)=>{
      worksheet.addRow([
        new Date(d.data_dispensacao).toLocaleString('pt-BR'),
        d.pacientes_2025_11_03_03_00?.nome || '',
        d.pacientes_2025_11_03_03_00?.cpf || '',
        d.medicamentos_2025_11_03_03_00?.nome || '',
        d.medicamentos_2025_11_03_03_00?.codigo || '',
        d.medicamentos_2025_11_03_03_00?.principio_ativo || '',
        d.medicamentos_2025_11_03_03_00?.concentracao || '',
        d.quantidade_dispensada,
        d.usuario_dispensacao,
        d.observacoes || ''
      ]);
    });
    // Formata as colunas
    worksheet.columns = [
      {
        width: 20
      },
      {
        width: 25
      },
      {
        width: 15
      },
      {
        width: 25
      },
      {
        width: 10
      },
      {
        width: 25
      },
      {
        width: 15
      },
      {
        width: 10
      },
      {
        width: 20
      },
      {
        width: 30
      }
    ];
    worksheet.eachRow((row, rowNumber)=>{
      if (rowNumber > 2) {
        row.eachCell((cell)=>{
          cell.border = {
            top: {
              style: 'thin',
              color: {
                argb: 'CCCCCC'
              }
            },
            left: {
              style: 'thin',
              color: {
                argb: 'CCCCCC'
              }
            },
            bottom: {
              style: 'thin',
              color: {
                argb: 'CCCCCC'
              }
            },
            right: {
              style: 'thin',
              color: {
                argb: 'CCCCCC'
              }
            }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
          };
        });
      }
    });
    // Gera buffer Excel
    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="dispensacoes_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
