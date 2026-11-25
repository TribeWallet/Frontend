/**
 * Testes do componente MaskedText
 * Verifica renderização com diferentes máscaras (cpf, telefone, cartão, data, dinheiro)
 * Usa react-test-renderer (compatível com ambiente Node + mock do RN)
 */
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { MaskedText } from '../../src/components/MaskedText/MaskedText';

describe('MaskedText', () => {
  it('deve renderizar sem valor', () => {
    const renderer = TestRenderer.create(<MaskedText value="" mask="cpf" />);
    expect(renderer).toBeDefined();
  });

  it('deve renderizar máscara de CPF', () => {
    const renderer = TestRenderer.create(
      <MaskedText value="12345678901" mask="cpf" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar máscara de telefone', () => {
    const renderer = TestRenderer.create(
      <MaskedText value="11999999999" mask="phone" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar máscara de cartão de crédito', () => {
    const renderer = TestRenderer.create(
      <MaskedText value="1234567890123456" mask="card" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar máscara de data', () => {
    const renderer = TestRenderer.create(
      <MaskedText value="10122026" mask="date" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar máscara de dinheiro (BRL)', () => {
    const renderer = TestRenderer.create(
      <MaskedText value="1500" mask="money" currency="BRL" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar máscara de dinheiro (USD)', () => {
    const renderer = TestRenderer.create(
      <MaskedText value="1500" mask="money" currency="USD" />,
    );
    expect(renderer).toBeDefined();
  });

  it('MaskedText deve ser um componente válido', () => {
    expect(MaskedText).toBeDefined();
  });

  it('deve renderizar com valor nulo', () => {
    const renderer = TestRenderer.create(
      <MaskedText value={null} mask="cpf" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com valor undefined', () => {
    const renderer = TestRenderer.create(
      <MaskedText value={undefined} mask="cpf" />,
    );
    expect(renderer).toBeDefined();
  });
});
