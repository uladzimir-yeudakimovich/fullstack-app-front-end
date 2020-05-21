import React, { useState, useEffect } from 'react'

import service from '../shared/service'
import Header from '../shared/header'
import LoginForm from './login-form'
import BlogsList from './blogs-list'
import CreateForm from './create-form'
import Notification from '../shared/notification'
import Button from '../shared/button'
import Togglable from './togglable'

const Blogs = () => {
  const [ blogs, setBlogs ] = useState([])
  const [ errorMessage, setErrorMessage ] = useState(null)
  const [ user, setUser ] = useState(null)
  const [ loginVisible, setLoginVisible ] = useState(false)
  const [ login, setLogin ] = useState('') 
  const [ password, setPassword ] = useState('')
  const [ title, setTitle ] = useState('') 
  const [ author, setAuthor ] = useState('')
  const [ url, setUrl ] = useState('')

  useEffect(() => {
    const _at = window.localStorage.getItem('_at')
    if (_at) {
      service.setToken(JSON.parse(_at))
      getBlogs()
    }
    const userLogin = window.localStorage.getItem('userLogin')
    if (userLogin) { setUser(JSON.parse(userLogin)) }
  }, [])

  const hideWhenVisible = { display: loginVisible ? 'none' : '' }
  const showWhenVisible = { display: loginVisible ? '' : 'none' }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await service.getToken('login', { login, password })
      window.localStorage.setItem('_at', JSON.stringify(user.token))
      window.localStorage.setItem('userLogin', JSON.stringify(login))
      service.setToken(user.token)
      getBlogs()
      setUser(login)
      setLogin('')
      setPassword('')
    } catch (error) {
      setErrorMessage(error.message)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const handleLogout = async () => {
    window.localStorage.clear()
    setUser(null)
  }

  const getBlogs = async () => await service.getAll('blogs').then(data => setBlogs(data))

  const createBlog = async (event) => {
    event.preventDefault()
    blogFormRef.current.toggleVisibility()
    try {
      await service.create('blogs', { title, author, url })
      setTitle('')
      setAuthor('')
      setUrl('')
      setErrorMessage({ success: `a new blog ${title} ${author} added` })
      setTimeout(() => setErrorMessage(null), 5000)
    } catch (error) {
      setErrorMessage(error.message)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const blogFormRef = React.createRef()

  if (user === null) {
    return (
      <>
        <Header name='log in to application' />
        <Notification message={errorMessage} />
        <Togglable buttonLabel='login'>
          <LoginForm
            submit={handleLogin}
            login={login}
            setLogin={setLogin}
            password={password}
            setPassword={setPassword}
          />
        </Togglable>
      </>
    )
  }
  return (
    <>
      <Header name='Blogs' />
      <span>{user} logged in</span>
      <Button handleClick={handleLogout} text="log out" />
      <Header name='create new' />
      <Notification message={errorMessage} />
      <Togglable buttonLabel='new blog' ref={blogFormRef}>
        <CreateForm
          createBlog={createBlog}
          title={title}
          setTitle={setTitle}
          author={author}
          setAuthor={setAuthor}
          url={url}
          setUrl={setUrl}
        />
      </Togglable>
      <BlogsList blogs={blogs} />
    </>
  )
}

export default Blogs
