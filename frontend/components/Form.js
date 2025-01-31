import React, { useEffect, useState } from 'react'
import * as yup from 'yup';
import axios from 'axios';

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.

const formSchema = yup.object().shape({
  fullName: yup
  .string()
  .required()
  .min(3, validationErrors.fullNameTooShort)
  .max(20, validationErrors.fullNameTooLong)
  .trim(),
  size: yup
  .string()
  .required()
  .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect),
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const initValues = {
  fullName: '',
  size: '',
  toppings: [],
}

const initErr = {
  fullName: '',
  size: '',
  toppings: '',
}

export default function Form() {
  const [ values, setValues ] = useState(initValues);
  const [ valErrors, setValErrors ] = useState(initErr);
  const [ success, setSuccess ] = useState();
  const [ failure, setFailure ] = useState();
  const [ disabled, setDisabled ] = useState(false);

  useEffect(() => {
    formSchema.isValid(values).then(setDisabled);
  }, [values]);

  const onSubmit = evt => {
    evt.preventDefault();
    const { fullName, size, toppings } = values;
    console.log('Values!', values);
    setDisabled(false);

    axios.post('http://localhost:9009/api/order', { fullName, size, toppings })
    .then(res => {
      console.log(res.data.message);
      setSuccess(res.data.message);
      setFailure('');
      setValues({ fullName: '', size: '', toppings: [] });
    })
    .catch(err => {
      console.log(err.response.data.message)
      setFailure(err.response.data.message);
      setSuccess('');
    })
  }

  const onChange = evt => {
    let { name, value, checked, type } = evt.target;
    const toppingId = value;
    if (type === 'checkbox') {
      setValues(prev => {
        if (checked) {
          return { ...prev, toppings: [...prev.toppings, toppingId] };
        } else {
          return { ...prev, toppings: prev.toppings.filter(topping => topping !== toppingId) };
        }
      });
      return;
    } else {
      setValues({ ...values, [name]: value });
    }
    yup.reach(formSchema, name).validate(value)
    .then(() => {
      setValErrors({ ...valErrors, [name]: '' });
      setDisabled(false);
    })
    .catch((err) => {
      setValErrors({ ...valErrors, [name]: err.errors[0] });
      setDisabled(true);
    })
  } 

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" name='fullName' type="text" onChange={onChange} value={values.fullName} />
        </div>
        {valErrors.fullName && <div className='error'>{valErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" name='size' onChange={onChange} value={values.size} >
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value='S'>Small</option>
            <option value='M'>Medium</option>
            <option value='L'>Large</option>
          </select>
        </div>
        {valErrors.size && <div className='error'>{valErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        
          {toppings.map(tops => (
            <label key={tops.topping_id}>
            <input
            // id='toppings'
            name={tops.topping_id}
            value={tops.topping_id}
            checked={values.toppings.includes(tops.topping_id)}
            type='checkbox'
            onChange={onChange}
            />
            {tops.text}<br /> 
            </label>
          )) }
          
        
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!disabled}/>
    </form>
  )
}
