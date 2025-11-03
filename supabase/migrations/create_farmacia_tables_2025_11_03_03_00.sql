-- Criar tabela de medicamentos
CREATE TABLE public.medicamentos_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255) NOT NULL,
    concentracao VARCHAR(100) NOT NULL,
    forma_farmaceutica VARCHAR(100) NOT NULL,
    apresentacao VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de estoque
CREATE TABLE public.estoque_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicamento_id UUID REFERENCES public.medicamentos_2025_11_03_03_00(id) ON DELETE CASCADE,
    quantidade_atual INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL DEFAULT 10,
    lote VARCHAR(50),
    data_validade DATE,
    data_entrada DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de pacientes
CREATE TABLE public.pacientes_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE,
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de dispensações
CREATE TABLE public.dispensacoes_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES public.pacientes_2025_11_03_03_00(id) ON DELETE CASCADE,
    medicamento_id UUID REFERENCES public.medicamentos_2025_11_03_03_00(id) ON DELETE CASCADE,
    quantidade_dispensada INTEGER NOT NULL,
    data_dispensacao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    observacoes TEXT,
    usuario_dispensacao VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de usuários do sistema
CREATE TABLE public.usuarios_sistema_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir usuário padrão admin
INSERT INTO public.usuarios_sistema_2025_11_03_03_00 (usuario, senha, nome_completo) 
VALUES ('admin', '0000', 'Administrador do Sistema');

-- Inserir medicamentos básicos do SUS
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
[
    ('001', 'Captopril', 'Captopril', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('002', 'Captopril', 'Captopril', '50mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('003', 'Losartana Potássica', 'Losartana Potássica', '50mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('004', 'Hidroclorotiazida', 'Hidroclorotiazida', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('005', 'Enalapril, Maleato', 'Enalapril', '10mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('006', 'Enalapril, Maleato', 'Enalapril', '20mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('007', 'Amlodipino', 'Besilato de Anlodipino', '5mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('008', 'Atenolol', 'Atenolol', '50mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('009', 'Propranolol', 'Cloridrato de Propranolol', '40mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('010', 'Metildopa', 'Metildopa', '250mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('011', 'Metformina', 'Cloridrato de Metformina', '500mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('012', 'Metformina', 'Cloridrato de Metformina', '850mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('013', 'Glibenclamida', 'Glibenclamida', '5mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('014', 'Gliclazida', 'Gliclazida', '30mg', 'Comprimido (lib. modificada)', 'Caixa com 30 comprimidos'),
    ('015', 'Insulina Humana NPH', 'Insulina Humana', '100 UI/mL', 'Suspensão Injetável', 'Frasco-ampola 10mL'),
    ('016', 'AAS', 'Ácido Acetilsalicílico', '100mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('017', 'Sinvastatina', 'Sinvastatina', '20mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('018', 'Furosemida', 'Furosemida', '40mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('019', 'Paracetamol', 'Paracetamol', '500mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('020', 'Paracetamol', 'Paracetamol', '100mg/mL', 'Solução Oral', 'Frasco com 15mL'),
    ('021', 'Dipirona Sódica', 'Dipirona Sódica', '500mg', 'Comprimido', 'Caixa com 10 comprimidos'),
    ('022', 'Dipirona Sódica', 'Dipirona Sódica', '500mg/mL', 'Solução Oral', 'Frasco com 20mL'),
    ('023', 'Ibuprofeno', 'Ibuprofeno', '100mg/mL', 'Suspensão Oral', 'Frasco com 20mL'),
    ('024', 'Diclofenaco Sódico', 'Diclofenaco Sódico', '50mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('025', 'Tramadol, Cloridrato', 'Tramadol', '50mg', 'Cápsula', 'Caixa com 10 cápsulas'),
    ('026', 'Amoxicilina', 'Amoxicilina', '500mg', 'Cápsula', 'Caixa com 21 cápsulas'),
    ('027', 'Amoxicilina', 'Amoxicilina', '250mg/5mL', 'Pó para Suspensão Oral', 'Frasco com 150mL'),
    ('028', 'Azitromicina', 'Azitromicina', '500mg', 'Comprimido', 'Caixa com 3 comprimidos'),
    ('029', 'Cefalexina', 'Cefalexina', '500mg', 'Cápsula', 'Caixa com 10 cápsulas'),
    ('030', 'Sulfametoxazol + Trimetoprima', 'Sulfametoxazol + Trimetoprima', '400mg + 80mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('031', 'Metronidazol', 'Metronidazol', '250mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('032', 'Nistatina', 'Nistatina', '100.000 UI/mL', 'Suspensão Oral', 'Frasco com 50mL'),
    ('033', 'Albendazol', 'Albendazol', '400mg', 'Comprimido', 'Caixa com 1 comprimido'),
    ('034', 'Fluoxetina', 'Cloridrato de Fluoxetina', '20mg', 'Cápsula', 'Caixa com 28 cápsulas'),
    ('035', 'Amitriptilina', 'Cloridrato de Amitriptilina', '25mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('036', 'Clonazepam', 'Clonazepam', '2mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('037', 'Diazepam', 'Diazepam', '10mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('038', 'Fenitoína Sódica', 'Fenitoína Sódica', '100mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('039', 'Carbamamazepina', 'Carbamamazepina', '200mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('040', 'Haloperidol', 'Haloperidol', '5mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('041', 'Carbonato de Lítio', 'Carbonato de Lítio', '300mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('042', 'Salbutamol', 'Sulfato de Salbutamol', '100mcg/dose', 'Aerossol Oral (Bomba)', 'Frasco pressurizado'),
    ('043', 'Ipratrópio, Brometo', 'Brometo de Ipratrópio', '0,25mg/mL', 'Solução para Nebulização', 'Frasco com 20mL'),
    ('044', 'Prednisona', 'Prednisona', '20mg', 'Comprimido', 'Caixa com 10 comprimidos'),
    ('045', 'Dexametasona', 'Dexametasona', '0,1mg/mL', 'Elixir', 'Frasco com 100mL'),
    ('046', 'Maleato de Dexclorfeniramina', 'Maleato de Dexclorfeniramina', '2mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('047', 'Loratadina', 'Loratadina', '10mg', 'Comprimido', 'Caixa com 12 comprimidos'),
    ('048', 'Omeprazol', 'Omeprazol', '20mg', 'Cápsula', 'Caixa com 28 cápsulas'),
    ('049', 'Ranitidina', 'Cloridrato de Ranitidina', '150mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('050', 'Hidróxido de Alumínio', 'Hidróxido de Alumínio', '60mg/mL', 'Suspensão Oral', 'Frasco com 150mL'),
    ('051', 'Metoclopramida', 'Cloridrato de Metoclopramida', '10mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('052', 'Domperidona', 'Domperidona', '10mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('053', 'Bisacodil', 'Bisacodil', '5mg', 'Comprimido', 'Caixa com 20 comprimidos'),
    ('054', 'Levonorgestrel + Etinilestradiol', 'Levonorgestrel + Etinilestradiol', '0,15mg + 0,03mg', 'Comprimido', 'Cartela com 21 comprimidos'),
    ('055', 'Medroxiprogesterona', 'Acetato de Medroxiprogesterona', '150mg/mL', 'Suspensão Injetável', 'Ampola 1mL (uso trimestral)'),
    ('056', 'Ácido Fólico', 'Ácido Fólico', '5mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('057', 'Sulfato Ferroso', 'Sulfato Ferroso', '40mg (ferro elementar)', 'Comprimido', 'Frasco com 50 comprimidos'),
    ('058', 'Vitamina D', 'Colecalciferol', '10.000 UI', 'Cápsula', 'Caixa com 30 cápsulas'),
    ('059', 'Permetrina', 'Permetrina', '50mg/g (5%)', 'Creme', 'Bisnaga com 30g'),
    ('060', 'Permetrina', 'Permetrina', '10mg/mL (1%)', 'Loção', 'Frasco com 60mL'),
    ('061', 'Cetoconazol', 'Cetoconazol', '20mg/g (2%)', 'Creme', 'Bisnaga com 30g'),
    ('062', 'Nistatina', 'Nistatina', '100.000 UI/g', 'Creme Vaginal', 'Bisnaga com aplicador'),
    ('063', 'Glicerina', 'Glicerina', '100mg/mL', 'Solução (Supositório)', 'Caixa com 6 supositórios (Adulto)'),
    ('064', 'Vaselina', 'Vaselina', '100%', 'Creme (Emoliente)', 'Bisnaga com 50g'),
    ('065', 'Ácido Retinóico', 'Tretinoína', '0,5mg/g (0,05%)', 'Creme', 'Bisnaga com 20g'),
    ('066', 'Acetato de Hidrocortisona', 'Hidrocortisona', '10mg/g (1%)', 'Creme', 'Bisnaga com 15g'),
    ('067', 'Betametasona', 'Valerato de Betametasona', '1mg/g (0,1%)', 'Creme', 'Bisnaga com 30g'),
    ('068', 'Cloridrato de Lidocaína', 'Lidocaína', '20mg/g (2%)', 'Pomada', 'Bisnaga com 10g'),
    ('069', 'Cloranfenicol', 'Cloranfenicol', '5mg/g (0,5%)', 'Pomada Oftálmica', 'Tubo com 3,5g'),
    ('070', 'Timolol, Maleato', 'Timolol', '5mg/mL (0,5%)', 'Solução Oftálmica', 'Frasco com 5mL'),
    ('071', 'Tobramicina', 'Tobramicina', '3mg/mL (0,3%)', 'Solução Oftálmica', 'Frasco com 5mL'),
    ('072', 'Cloreto de Sódio', 'Cloreto de Sódio', '9mg/mL (0,9%)', 'Solução Nasal', 'Frasco com 30mL'),
    ('073', 'Cloridrato de Nafazolina', 'Nafazolina', '0,5mg/mL', 'Solução Nasal', 'Frasco com 10mL'),
    ('074', 'Glicose', 'Glicose', '50mg', 'Comprimido', 'Caixa com 10 comprimidos'),
    ('075', 'Cloridrato de Tiamina (B1)', 'Tiamina', '300mg', 'Comprimido', 'Caixa com 30 comprimidos'),
    ('076', 'Vitamina A', 'Retinol', '100.000 UI', 'Cápsula', 'Caixa com 50 cápsulas'),
    ('077', 'Gluconato de Cálcio', 'Gluconato de Cálcio', '10mg/mL', 'Solução Injetável', 'Ampola 10mL'),
    ('078', 'Cloridrato de Adrenalina', 'Epinefrina', '1mg/mL', 'Solução Injetável', 'Ampola 1mL');

-- Inserir estoque inicial para alguns medicamentos
INSERT INTO public.estoque_2025_11_03_03_00 (medicamento_id, quantidade_atual, quantidade_minima, lote, data_validade) 
SELECT id, 100, 20, 'LOTE001', '2025-12-31' FROM public.medicamentos_2025_11_03_03_00 WHERE codigo IN ('001', '002', '003', '004', '005');

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.medicamentos_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispensacoes_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_sistema_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso para usuários autenticados)
CREATE POLICY "Permitir acesso completo medicamentos" ON public.medicamentos_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo estoque" ON public.estoque_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo pacientes" ON public.pacientes_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo dispensacoes" ON public.dispensacoes_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo usuarios" ON public.usuarios_sistema_2025_11_03_03_00 FOR ALL USING (true);