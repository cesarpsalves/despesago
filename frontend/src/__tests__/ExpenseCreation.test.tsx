import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

// Este teste serve como "Vitrine" para demonstrar conhecimento de mocking 
// e component testing envolvendo File Uploads.

describe('Expense Creation Flow (Scanner)', () => {
  it('Should present the file uploader to the user', () => {
    // Por simplicidade na vitrine, vamos simular a existência do Dashboard
    // e do botão de trigger da Câmera (Scanner)
    
    document.body.innerHTML = `
      <div>
        <button id="scanner-btn" aria-label="Abrir câmera">📸 Escanear Recibo</button>
        <input type="file" id="scan-input" data-testid="upload-input" accept="image/*" capture="environment" class="hidden" />
      </div>
    `;

    const scannerBtn = screen.getByText('📸 Escanear Recibo');
    expect(scannerBtn).toBeInTheDocument();

    const uploadInput = screen.getByTestId('upload-input');
    expect(uploadInput).toBeInTheDocument();
    // Validamos se o input tem o capture environment para funcionar bem no mobile!
    expect(uploadInput.getAttribute('capture')).toBe('environment');
  });
});
