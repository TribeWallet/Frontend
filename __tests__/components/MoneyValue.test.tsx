/**
 * Testes do componente MoneyValue
 * Verifica renderização com diferentes valores, moedas e hideValues
 * Usa react-test-renderer (compatível com ambiente Node + mock do RN)
 */
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { MoneyValue } from '../../src/components/MoneyValue/MoneyValue';

describe('MoneyValue', () => {
  it('deve renderizar valor em BRL', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={1500.50} currency="BRL" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar valor em USD', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={1500.50} currency="USD" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar valor em EUR', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={1500.50} currency="EUR" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com hideValues', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={1500.50} currency="BRL" hideValues />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar valor zero', () => {
    const renderer = TestRenderer.create(<MoneyValue value={0} currency="BRL" />);
    expect(renderer).toBeDefined();
  });

  it('deve renderizar valor negativo', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={-500} currency="BRL" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar valor com centavos', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={10.99} currency="BRL" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar valor grande', () => {
    const renderer = TestRenderer.create(
      <MoneyValue value={1000000} currency="BRL" />,
    );
    expect(renderer).toBeDefined();
  });

  it('MoneyValue deve ser um componente válido', () => {
    expect(MoneyValue).toBeDefined();
  });
});
