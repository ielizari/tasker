import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { renderWithProviders } from './test-utils'

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });
describe("Muestra lista de tareas", () =>{
  it("Lista de tareas", async()=>{
    //const spy = jest.spyOn('fetch')
    renderWithProviders(<App />)
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument();
  })
})

describe("Detalle de tarea", () => {
  it("Muestra todos los campos de una tarea", async() => {
    renderWithProviders(<App />, {route: 'tasks/1'})
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument();
    expect(await screen.findByText(/Comprar huevos, leche, cebollas/i)).toBeInTheDocument();
    expect(await screen.findByText(/Iñaki/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pendiente/i)).toBeInTheDocument();
    expect(await screen.findByText(/Alta/i)).toBeInTheDocument();
  })

  it("Muestra mensaje 'La tarea no existe' si no se busca un id que no existe", async() => {
    renderWithProviders(<App />, {route: 'tasks/5'})
    expect(await screen.findByText(/La tarea no existe/i)).toBeInTheDocument();
  })
})
