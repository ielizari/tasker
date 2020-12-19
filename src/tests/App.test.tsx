import React from 'react';
import { screen } from '@testing-library/react';
import App from '../App';
import { renderWithProviders } from './test-utils'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils';

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

    expect(await screen.queryByText(/Esta acción es irreversible. ¿Desea continuar?/i)).not.toBeInTheDocument()
  })

  it("Muestra mensaje 'La tarea no existe' si se busca un id que no existe", async() => {
    renderWithProviders(<App />, {route: 'tasks/1111'})
    expect(await screen.findByText(/La tarea no existe/i)).toBeInTheDocument();
  })

  it("Muestra los botones de editar, borrar y crear subtarea al ver el detalle de una tarea", async () => {
    renderWithProviders(<App />, {route: '/tasks/1'})
    expect(await screen.findByLabelText(/Editar/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Borrar/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Subtarea/i)).toBeInTheDocument()
  })

  it("El botón 'Editar' carga la url tasks/edit/1", async() => {
    renderWithProviders(<App />, {route: 'tasks/1'})
    expect(await screen.findByLabelText(/Editar/i)).toHaveAttribute('href','/tasks/edit/1')
  })

  it("El botón 'Subtarea' carga la url tasks/new/1", async() => {
    renderWithProviders(<App />, {route: 'tasks/1'})
    expect(await screen.findByLabelText(/Subtarea/i)).toHaveAttribute('href','/tasks/new/1')
  })

  it("El botón 'Borrar' muestra diálogo de confirmación", async() => {   
    await renderWithProviders(<App />, {route: 'tasks/1'})  
    userEvent.click(await screen.findByLabelText(/Borrar/i))
    expect(await screen.queryByText(/Esta acción es irreversible. ¿Desea continuar?/i)).toBeInTheDocument()
    expect(await screen.queryByLabelText(/Aceptar/i)).toBeInTheDocument()
    expect(await screen.queryByLabelText(/Cancelar/i)).toBeInTheDocument()
  })

  it("Al pulsar 'Aceptar' en el diálogo de confirmación de la acción 'Borrar', se borra la tarea", async() => {   
    await renderWithProviders(<App />, {route: 'tasks/1'})  
    await act(async () => {
      userEvent.click(await screen.findByLabelText(/Borrar/i))
    })    
    
    await act(async() => {
      userEvent.click(await screen.queryByLabelText(/Aceptar/i))
    })
    
    expect(await screen.findByLabelText("success-message")).toHaveTextContent(/La tarea se ha eliminado con éxito/i)

  })
})

describe("Nueva tarea", () => {
 
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
     
      await act( async() => {
        userEvent.click(await screen.getByText(/Guardar/i))
      })

      expect(await screen.findByLabelText('validate_title')).toHaveTextContent(/Campo obligatorio/i)
      expect(await screen.findByLabelText('validate_author')).toHaveTextContent(/Campo obligatorio/i)
  })

  it("Se introduce una fecha válida y el formulario la valida correctamente", async() => {
    renderWithProviders(<App />, {route: '/tasks/new'})

    await act( async() => {
      userEvent.type(await screen.getByLabelText(/Fecha Límite/i),"28/12/2020")
    })
    await act( async() => {
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.queryByLabelText('validate_limitDate')).not.toBeInTheDocument()
})

  it.only("Guarda una tarea nueva correctamente", async() => {
       
      renderWithProviders(<App />, {route: '/tasks/new'})

      await act(async () => {
        userEvent.type(await screen.findByLabelText('title'),'Add tarea test')
        userEvent.type(await screen.findByLabelText('description'),'success')
        userEvent.type(await screen.findByLabelText('author'),'DummyUser')
        userEvent.click(screen.getByText(/Guardar/i))
      })

      expect(await screen.findByLabelText('success-message')).toHaveTextContent(/La tarea 'Add tarea test' ha sido creada con éxito/i)
  })

  it("Muestra un mensaje de error si no se ha podido añadir la tarea, manetniendo los datos introducidos", async() => {
       
    renderWithProviders(<App />, {route: '/tasks/new'})

    await act(async () => {
      userEvent.type(await screen.findByLabelText('title'),'Add tarea test')
      userEvent.type(await screen.findByLabelText('description'),'error')
      userEvent.type(await screen.findByLabelText('author'),'DummyUser')
      userEvent.click(screen.getByText(/Guardar/i))
    })

    expect(await screen.findByLabelText('error-message')).toHaveTextContent(/Error al crear la tarea/i)

    expect(await screen.findByLabelText('title')).toHaveValue("Add tarea test")
    expect(await screen.findByLabelText('description')).toHaveValue("error")
    expect(await screen.findByLabelText('author')).toHaveValue("DummyUser")
    expect(await screen.queryByLabelText('loading')).not.toBeInTheDocument()
})
  
})

describe("Editar tarea", () => {
    it("Muestra el formulario de edición de tareas y carga los datos de la tarea seleccionada", async () => {
      renderWithProviders(<App />, {route: '/tasks/edit/1'})
      
      expect(await screen.findByLabelText('title')).toHaveValue("Hacer la compra")
      expect(await screen.findByLabelText('description')).toHaveValue("Comprar huevos, leche, cebollas")
      expect(await screen.findByLabelText('author')).toHaveValue("Iñaki")
      expect(await screen.findByLabelText('limitDate')).toHaveValue("01/12/2020 09:45")
      expect(await screen.findByLabelText('status')).toHaveValue("1")
      expect(await screen.findByLabelText('status')).toHaveTextContent("Pendiente")
      expect(await screen.findByLabelText('priority')).toHaveValue("3")
      expect(await screen.findByLabelText('priority')).toHaveTextContent("Alta")
    })

    it("Muestra mensaje de éxito al pulsar el botón 'Guardar' actualizar los datos de la tarea", async () => {
      renderWithProviders(<App />, {route: '/tasks/edit/1'})

      await act(async () => {
        userEvent.click(await screen.findByLabelText('Guardar'))
      })

      expect(await screen.findByLabelText('success-message')).toHaveTextContent(/La tarea 'Hacer la compra' ha sido editada con éxito/i)
      expect(await screen.queryByLabelText('loading')).not.toBeInTheDocument()
    })
})
