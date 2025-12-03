// Tabela simplificada de alíquotas de ICMS para transporte interestadual no Brasil.
// Fonte: Baseado nas regras gerais do CONFAZ.
// NOTA: Esta tabela não cobre regimes especiais ou exceções fiscais.
// As chaves representam o estado de ORIGEM. Os valores aninhados representam o estado de DESTINO.

interface IcmsRates {
  [originState: string]: {
    [destinationState: string]: number;
  };
}

export const ICMS_RATES: IcmsRates = {
  // Região Sudeste
  'SP': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 12, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RJ': 12, 'RN': 7, 'RS': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 18, 'SE': 7, 'TO': 7 },
  'RJ': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 12, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RJ': 20, 'RN': 7, 'RS': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 12, 'SE': 7, 'TO': 7 },
  'MG': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 18, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RJ': 12, 'RN': 7, 'RS': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 12, 'SE': 7, 'TO': 7 },
  'ES': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 17, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 12, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RJ': 12, 'RN': 7, 'RS': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 12, 'SE': 7, 'TO': 7 },
  // Região Sul
  'PR': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 12, 'PA': 7, 'PB': 7, 'PR': 19, 'PE': 7, 'PI': 7, 'RJ': 12, 'RN': 7, 'RS': 12, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 12, 'SE': 7, 'TO': 7 },
  'SC': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 12, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RJ': 12, 'RN': 7, 'RS': 12, 'RO': 7, 'RR': 7, 'SC': 17, 'SP': 12, 'SE': 7, 'TO': 7 },
  'RS': { 'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7, 'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MT': 7, 'MS': 7, 'MG': 12, 'PA': 7, 'PB': 7, 'PR': 12, 'PE': 7, 'PI': 7, 'RJ': 12, 'RN': 7, 'RS': 17, 'RO': 7, 'RR': 7, 'SC': 12, 'SP': 12, 'SE': 7, 'TO': 7 },
  // Região Centro-Oeste
  'GO': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 17, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'MT': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 17, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'MS': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 17, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'DF': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 18, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  // Região Nordeste
  'MA': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 20, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'PI': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 21, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'CE': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 20, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'RN': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 20, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'PB': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 18, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'PE': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 20.5, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'AL': { 'AC': 12, 'AL': 19, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'SE': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 19, 'TO': 12 },
  'BA': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 19, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  // Região Norte
  'RO': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 17.5, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'AC': { 'AC': 17, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'AM': { 'AC': 12, 'AL': 12, 'AM': 20, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'RR': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 20, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'PA': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 19, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'AP': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 18, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 12 },
  'TO': { 'AC': 12, 'AL': 12, 'AM': 12, 'AP': 12, 'BA': 12, 'CE': 12, 'DF': 12, 'ES': 12, 'GO': 12, 'MA': 12, 'MT': 12, 'MS': 12, 'MG': 7, 'PA': 12, 'PB': 12, 'PR': 7, 'PE': 12, 'PI': 12, 'RJ': 7, 'RN': 12, 'RS': 7, 'RO': 12, 'RR': 12, 'SC': 7, 'SP': 7, 'SE': 12, 'TO': 20 },
};

export const getIcmsRate = (origin: string, destination: string): number => {
  const originState = origin.split(',').pop()?.trim().toUpperCase();
  const destState = destination.split(',').pop()?.trim().toUpperCase();

  if (!originState || !destState) return 0;

  const originRates = ICMS_RATES[originState];
  if (!originRates) return 0;

  return originRates[destState] || 0;
};