import React from 'react';
import { screen } from '@testing-library/react';
import App from '../App';
import { renderWithProviders } from './test-utils'
import userEvent from '@testing-library/user-event'
import { clearScreenDown } from 'readline';

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Muestra lista de tareas", () =>{
  beforeEach(()=>{
    jest.resetAllMocks();
  });
  it("Lista de tareas", async()=>{
    //const spy = jest.spyOn('fetch')
    renderWithProviders(<App />)
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument();
  }) 
})

describe("Detalle de tarea", () => {
  beforeEach(()=>{
    jest.resetAllMocks();
  });
  it("Muestra todos los campos de una tarea", async() => {
    renderWithProviders(<App />, {route: '/tasks/1'})
    expect(await screen.findByText(/Hacer la compra/i)).toBeInTheDocument();
    expect(await screen.findByText(/Comprar huevos, leche, cebollas/i)).toBeInTheDocument();
    expect(await screen.findByText(/Iñaki/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pendiente/i)).toBeInTheDocument();
    expect(await screen.findByText(/Alta/i)).toBeInTheDocument();
  })

  it("Muestra mensaje 'La tarea no existe' si se busca un id que no existe", async() => {
    renderWithProviders(<App />, {route: 'tasks/1111'})
    expect(await screen.findByText(/La tarea no existe/i)).toBeInTheDocument();
  })
})

describe("Nueva tarea", () => {
  beforeEach(()=>{
    jest.resetModules();
  });
  it("Muestra los campos de la nueva tarea con los valores por defecto", async() =>{      
      renderWithProviders(<App />, {route: '/tasks/new'})
      expect(await screen.findByLabelText('title')).toHaveValue("")
      expect(await screen.findByLabelText('description')).toHaveValue("")
      expect(await screen.findByLabelText('author')).toHaveValue("")
      expect(await screen.findByLabelText('limitDate')).toHaveValue("")
      expect(await screen.findByLabelText('status')).toHaveValue("1")
      expect(await screen.findByLabelText('priority')).toHaveValue("1")
  }) 

  it("Al enviar el formulario de nueva tarea vacío se muestra error en los campos obligatorios", async() => {
      renderWithProviders(<App />, {route: '/tasks/new'})
      userEvent.click(screen.getByText(/Enviar/i))

      expect(await screen.findByLabelText('validate_title')).toHaveTextContent(/Campo obligatorio/i)
      expect(await screen.findByLabelText('validate_author')).toHaveTextContent(/Campo obligatorio/i)
  })

  it("Guarda una tarea nueva correctamente", async() => {
      renderWithProviders(<App />, {route: '/tasks/new'})
      userEvent.type(await screen.findByLabelText('title'),'Tarea de prueba')
      userEvent.type(await screen.findByLabelText('author'),'DummyUser')
      userEvent.click(screen.getByText(/Enviar/i))

      expect(await screen.findByLabelText('success-message')).toHaveTextContent(/La tarea 'Tarea de prueba' ha sido creada con éxito/i)
  })
  
})

describe("Editar tarea", ()=>{
    it.only("Muestra el botón de editar al ver el detalle de una tarea", async () => {
        renderWithProviders(<App />, {route: '/tasks/1'})
        expect(await screen.findByLabelText(/Editar/i)).toBeInTheDocument()
    })
})
