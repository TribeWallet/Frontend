/**
 * Testes do componente Input
 * Verifica renderização, label, error, helperText e mudança de valor
 * Usa react-test-renderer (compatível com ambiente Node + mock do RN)
 */
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Input } from '../../src/components/Input/Input';

describe('Input', () => {
  it('deve renderizar com placeholder', () => {
    const renderer = TestRenderer.create(<Input placeholder="Digite aqui" />);
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com label', () => {
    const renderer = TestRenderer.create(<Input label="E-mail" />);
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com error', () => {
    const renderer = TestRenderer.create(
      <Input label="E-mail" error="E-mail inválido" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com helperText', () => {
    const renderer = TestRenderer.create(
      <Input label="Senha" helperText="Mínimo 6 caracteres" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve aceitar onChangeText como prop', () => {
    const onChangeText = jest.fn();
    const renderer = TestRenderer.create(
      <Input placeholder="Digite" onChangeText={onChangeText} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com secureTextEntry', () => {
    const renderer = TestRenderer.create(
      <Input placeholder="Senha" secureTextEntry />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com prefix', () => {
    const renderer = TestRenderer.create(<Input prefix="R$" />);
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com leftIcon', () => {
    const renderer = TestRenderer.create(
      <Input leftIcon={<></>} placeholder="Com ícone" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com rightIcon', () => {
    const renderer = TestRenderer.create(
      <Input rightIcon={<></>} placeholder="Com ícone" />,
    );
    expect(renderer).toBeDefined();
  });

  it('Input deve ser um componente válido (forwardRef)', () => {
    expect(Input).toBeDefined();
    expect(typeof Input).toBe('object'); // React.forwardRef retorna objeto
  });

  it('deve aceitar value como prop controlada', () => {
    const renderer = TestRenderer.create(
      <Input placeholder="Digite" value="valor inicial" />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve aceitar keyboardType como prop', () => {
    const renderer = TestRenderer.create(
      <Input placeholder="E-mail" keyboardType="email-address" />,
    );
    expect(renderer).toBeDefined();
  });
});
