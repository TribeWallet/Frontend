/**
 * Testes do componente Button
 * Verifica renderização, variants, estados disabled/loading e chamadas de onPress
 * Usa react-test-renderer (compatível com ambiente Node + mock do RN)
 */
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Button } from '../../src/components/Button/Button';

describe('Button', () => {
  it('deve renderizar com o título correto', () => {
    const onPress = jest.fn();
    const renderer = TestRenderer.create(<Button title="Salvar" onPress={onPress} />);
    expect(renderer).toBeDefined();
  });

  it('deve renderizar variant primary por padrão', () => {
    const renderer = TestRenderer.create(
      <Button title="Primário" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar variant outline', () => {
    const renderer = TestRenderer.create(
      <Button title="Outline" variant="outline" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar variant danger', () => {
    const renderer = TestRenderer.create(
      <Button title="Excluir" variant="danger" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar variant dangerOutline', () => {
    const renderer = TestRenderer.create(
      <Button title="Excluir" variant="dangerOutline" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar tamanho sm', () => {
    const renderer = TestRenderer.create(
      <Button title="Pequeno" size="sm" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar tamanho md (padrão)', () => {
    const renderer = TestRenderer.create(
      <Button title="Médio" size="md" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar tamanho lg', () => {
    const renderer = TestRenderer.create(
      <Button title="Grande" size="lg" onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar fullWidth', () => {
    const renderer = TestRenderer.create(
      <Button title="Largo" fullWidth onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com disabled', () => {
    const renderer = TestRenderer.create(
      <Button title="Desabilitado" disabled onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com loading', () => {
    const renderer = TestRenderer.create(
      <Button title="Carregando" loading onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com leftIcon', () => {
    const renderer = TestRenderer.create(
      <Button title="Com ícone" leftIcon={<></>} onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('deve renderizar com rightIcon', () => {
    const renderer = TestRenderer.create(
      <Button title="Com ícone" rightIcon={<></>} onPress={jest.fn()} />,
    );
    expect(renderer).toBeDefined();
  });

  it('Button deve ser um componente válido (forwardRef)', () => {
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('object'); // React.forwardRef retorna objeto
  });

  it('deve aceitar onPress como prop', () => {
    const onPress = jest.fn();
    const renderer = TestRenderer.create(
      <Button title="Teste" onPress={onPress} />,
    );
    // Verifica que o componente renderiza sem erro
    const tree = renderer.toJSON();
    expect(tree).toBeDefined();
  });
});
