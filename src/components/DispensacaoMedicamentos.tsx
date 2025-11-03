import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, User, Pill } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Medicamento {
  id: string;
  codigo: string;
  nome: string;
  principio_ativo: string;
  concentracao: string;
  forma_farmaceutica: string;
  apresentacao: string;
}

interface Estoque {
  id: string;
  medicamento_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
  lote: string;
  data_validade: string;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
}

const DispensacaoMedicamentos: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [searchMedicamento, setSearchMedicamento] = useState('');
  const [novoPaciente, setNovoPaciente] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    endereco: ''
  });
  const [dispensacao, setDispensacao] = useState({
    paciente_id: '',
    medicamento_id: '',
    quantidade_dispensada: '',
    observacoes: ''
  });
  const [showNovoPaciente, setShowNovoPaciente] = useState(false);
  const { toast } = useToast();
  const { usuario } = useAuth();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: medicamentosData } = await supabase
        .from('medicamentos_2025_11_03_03_00')
        .select('*')
        .order('nome');

      const { data: estoqueData } = await supabase
        .from('estoque_2025_11_03_03_00')
        .select('*');

      const { data: pacientesData } = await supabase
        .from('pacientes_2025_11_03_03_00')
        .select('*')
        .order('nome');

      setMedicamentos(medicamentosData || []);
      setEstoque(estoqueData || []);
      setPacientes(pacientesData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarCPF = (cpf: string) => {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const cadastrarPaciente = async () => {
    if (!novoPaciente.nome || !novoPaciente.cpf) {
      toast({
        title: "Erro",
        description: "Nome e CPF são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pacientes_2025_11_03_03_00')
        .insert([{
          ...novoPaciente,
          cpf: formatarCPF(novoPaciente.cpf)
        }])
        .select()
        .single();

      if (error) throw error;

      setPacientes([...pacientes, data]);
      setDispensacao({ ...dispensacao, paciente_id: data.id });
      setNovoPaciente({
        nome: '',
        cpf: '',
        data_nascimento: '',
        telefone: '',
        endereco: ''
      });
      setShowNovoPaciente(false);
      
      toast({
        title: "Sucesso",
        description: "Paciente cadastrado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar paciente",
        variant: "destructive"
      });
    }
  };

  const realizarDispensacao = async () => {
    if (!dispensacao.paciente_id || !dispensacao.medicamento_id || !dispensacao.quantidade_dispensada) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive"
      });
      return;
    }

    const quantidade = parseInt(dispensacao.quantidade_dispensada);
    const estoqueItem = estoque.find(e => e.medicamento_id === dispensacao.medicamento_id);
    
    if (!estoqueItem || estoqueItem.quantidade_atual < quantidade) {
      toast({
        title: "Erro",
        description: "Quantidade insuficiente em estoque",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: dispensacaoError } = await supabase
        .from('dispensacoes_2025_11_03_03_00')
        .insert([{
          ...dispensacao,
          quantidade_dispensada: quantidade,
          usuario_dispensacao: usuario?.nome_completo || 'Sistema'
        }]);

      if (dispensacaoError) throw dispensacaoError;

      const { error: estoqueError } = await supabase
        .from('estoque_2025_11_03_03_00')
        .update({ 
          quantidade_atual: estoqueItem.quantidade_atual - quantidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', estoqueItem.id);

      if (estoqueError) throw estoqueError;

      setEstoque(estoque.map(e => 
        e.id === estoqueItem.id 
          ? { ...e, quantidade_atual: e.quantidade_atual - quantidade }
          : e
      ));

      setDispensacao({
        paciente_id: '',
        medicamento_id: '',
        quantidade_dispensada: '',
        observacoes: ''
      });
      setSearchMedicamento('');

      toast({
        title: "Sucesso",
        description: "Dispensação realizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar dispensação",
        variant: "destructive"
      });
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchPaciente.toLowerCase()) ||
    p.cpf.includes(searchPaciente)
  );

  const medicamentosComEstoque = medicamentos.map(med => {
    const estoqueItem = estoque.find(e => e.medicamento_id === med.id);
    return {
      ...med,
      quantidade_estoque: estoqueItem?.quantidade_atual || 0
    };
  }).filter(med => med.quantidade_estoque > 0);

  const medicamentosFiltrados = medicamentosComEstoque.filter(med =>
    med.nome.toLowerCase().includes(searchMedicamento.toLowerCase()) ||
    med.principio_ativo.toLowerCase().includes(searchMedicamento.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify
