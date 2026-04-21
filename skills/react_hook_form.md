# Form Validation Standards: React Hook Form

## Core Philosophy
Every form in this application MUST use `react-hook-form` rather than relying on native HTML5 validation (like `required`) or standard React local state (`useState` + `onChange`). This ensures a unified validation visual language, reduces unnecessary renders, and handles complex error states consistently.

## Implementation Guide

1. **Setup**: Always import the `useForm` hook from `react-hook-form`.
2. **State Management**: Destructure `register`, `handleSubmit`, and `errors` from the hook. Do NOT use `useState` to bind form inputs.
3. **Registering Inputs**: 
   - Spread the `register` function inside the input: `{...register('fieldName', { rules })}`.
   - Always map the input to the correct API expected field name.
4. **Validation Rules**:
   - `required`: Provide a custom message instead of a boolean (`required: 'Email is required'`).
   - `pattern`: Use Regex for standardized data (emails, phones).
   - `minLength` / `maxLength`: Clearly describe character boundaries.
5. **Handling Submissions**: 
   - Use `onSubmit={handleSubmit(customSubmitFunction)}`.
   - Your `customSubmitFunction` will receive a parsed data object. There is no need to run `e.preventDefault()`.
6. **Error Display**:
   - For every input, securely conditionally render the error beneath the wrapper:
     `{errors.fieldName && <span className="validation-error">{errors.fieldName.message}</span>}`
   - Use the `.validation-error` CSS class available across the application.

## Pattern Example

```javascript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const ExampleForm = ({ apiAction }) => {
    // 1. Initialize React Hook Form
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    // 2. Pure Data Submission (No e.preventDefault needed)
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await apiAction(data.email, data.password);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                    <input
                        type="text"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address format"
                            }
                        })}
                    />
                </div>
                {/* 3. Standardized Error Display */}
                {errors.email && <span className="validation-error">{errors.email.message}</span>}
            </div>

            <button disabled={loading}>Submit</button>
        </form>
    );
};
```
