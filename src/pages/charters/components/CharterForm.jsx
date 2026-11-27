import React, { useState } from 'react'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

const createEmptyStep = (stepOrder) => ({
  stepOrder,
  title: '',
  description: '',
  estimatedDurationMinutes: ''
})

const buildInitialState = (values) => ({
  title: values?.title || '',
  objective: values?.objective || '',
  safetyPrecautions: values?.safetyPrecautions || '',
  requiredResources: values?.requiredResources || '',
  steps: values?.steps?.length
    ? [...values.steps]
        .sort((left, right) => (left.stepOrder || 0) - (right.stepOrder || 0))
        .map((step) => ({
          stepOrder: step.stepOrder ?? '',
          title: step.title || '',
          description: step.description || '',
          estimatedDurationMinutes: step.estimatedDurationMinutes ?? ''
        }))
    : [createEmptyStep(1)]
})

const TextAreaField = ({ label, name, value, onChange, error, rows = 4, required = false, helperText }) => (
  <div className="charter-field">
    <label className="input-label" htmlFor={name}>
      {label}
      {required && <span className="input-required">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      className={`input-field charter-textarea ${error ? 'input-error' : ''}`}
    />
    {error ? (
      <span className="input-error-text">{error}</span>
    ) : helperText ? (
      <span className="input-helper-text">{helperText}</span>
    ) : null}
  </div>
)

export const CharterForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = 'Enregistrer',
  error = ''
}) => {
  const [form, setForm] = useState(() => buildInitialState(initialValues))
  const [fieldErrors, setFieldErrors] = useState({})

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const setStepField = (index, name, value) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [name]: value } : step
      )
    }))
    setFieldErrors((prev) => ({ ...prev, [`step_${index}_${name}`]: '' }))
  }

  const addStep = () => {
    setForm((prev) => {
      const nextOrder = prev.steps.reduce(
        (max, step) => Math.max(max, Number(step.stepOrder) || 0),
        0
      ) + 1
      return {
        ...prev,
        steps: [...prev.steps, createEmptyStep(nextOrder)]
      }
    })
  }

  const removeStep = (index) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, stepIndex) => stepIndex !== index)
        .map((step, stepIndex) => ({ ...step, stepOrder: stepIndex + 1 }))
    }))
    setFieldErrors({})
  }

  const validate = () => {
    const errors = {}
    const title = form.title.trim()
    const objective = form.objective.trim()

    if (!title) {
      errors.title = 'Le titre est obligatoire'
    } else if (title.length < 5 || title.length > 150) {
      errors.title = 'Le titre doit comporter entre 5 et 150 caractères'
    }
    if (!objective) {
      errors.objective = "L'objectif est obligatoire"
    }
    if (!form.steps.length) {
      errors.steps = 'La charte doit comporter au moins une étape'
    }

    form.steps.forEach((step, index) => {
      const duration = step.estimatedDurationMinutes

      if (!Number.isInteger(Number(step.stepOrder)) || Number(step.stepOrder) <= 0) {
        errors[`step_${index}_stepOrder`] = "L'ordre doit être supérieur à 0"
      }
      if (!step.title.trim()) {
        errors[`step_${index}_title`] = 'Le titre de l’étape est obligatoire'
      } else if (step.title.trim().length > 150) {
        errors[`step_${index}_title`] = 'Le titre ne doit pas dépasser 150 caractères'
      }
      if (!step.description.trim()) {
        errors[`step_${index}_description`] = 'La description est obligatoire'
      }
      if (duration !== '' && duration !== null && (!Number.isInteger(Number(duration)) || Number(duration) <= 0)) {
        errors[`step_${index}_estimatedDurationMinutes`] = 'La durée doit être positive'
      }
    })

    const validOrders = form.steps
      .map((step) => Number(step.stepOrder))
      .filter((order) => Number.isInteger(order) && order > 0)
    if (new Set(validOrders).size !== validOrders.length) {
      errors.steps = 'Chaque étape doit avoir un ordre unique'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      title: form.title.trim(),
      objective: form.objective.trim(),
      safetyPrecautions: form.safetyPrecautions.trim() || undefined,
      requiredResources: form.requiredResources.trim() || undefined,
      steps: form.steps.map((step) => ({
        stepOrder: Number(step.stepOrder),
        title: step.title.trim(),
        description: step.description.trim(),
        ...(step.estimatedDurationMinutes !== '' && step.estimatedDurationMinutes !== null
          ? { estimatedDurationMinutes: Number(step.estimatedDurationMinutes) }
          : {})
      }))
    }

    await onSubmit(payload)
  }

  return (
    <form className="charter-form" onSubmit={handleSubmit}>
      {error && (
        <div className="charter-alert charter-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="charter-form-grid">
        <Input
          label="Titre de la charte"
          name="charterTitle"
          required
          value={form.title}
          onChange={(event) => setField('title', event.target.value)}
          error={fieldErrors.title}
          placeholder="Ex. Intervention sur alimentation électrique"
        />
        <TextAreaField
          label="Objectif de l'intervention"
          name="charterObjective"
          required
          value={form.objective}
          onChange={(event) => setField('objective', event.target.value)}
          error={fieldErrors.objective}
        />
        <TextAreaField
          label="Précautions et risques"
          name="charterSafety"
          value={form.safetyPrecautions}
          onChange={(event) => setField('safetyPrecautions', event.target.value)}
          rows={3}
          helperText="Facultatif"
        />
        <TextAreaField
          label="Ressources nécessaires"
          name="charterResources"
          value={form.requiredResources}
          onChange={(event) => setField('requiredResources', event.target.value)}
          rows={3}
          helperText="Facultatif"
        />
      </div>

      <div className="charter-steps-editor">
        <div className="charter-steps-editor-header">
          <div>
            <h4>Actions ou étapes prévues</h4>
            <span className="input-helper-text">Au moins une étape est requise.</span>
          </div>
          <Button variant="secondary" size="sm" icon={Plus} onClick={addStep}>
            Ajouter une étape
          </Button>
        </div>
        {fieldErrors.steps && <span className="input-error-text">{fieldErrors.steps}</span>}

        <div className="charter-step-editor-list">
          {form.steps.map((step, index) => (
            <div className="charter-step-editor" key={index}>
              <div className="charter-step-editor-header">
                <span>Étape {index + 1}</span>
                {form.steps.length > 1 && (
                  <button
                    type="button"
                    className="charter-remove-step"
                    onClick={() => removeStep(index)}
                    title="Supprimer cette étape"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="charter-step-editor-grid">
                <Input
                  label="Ordre"
                  name={`stepOrder_${index}`}
                  type="number"
                  min="1"
                  required
                  value={step.stepOrder}
                  onChange={(event) => setStepField(index, 'stepOrder', event.target.value)}
                  error={fieldErrors[`step_${index}_stepOrder`]}
                />
                <Input
                  label="Durée estimée (minutes)"
                  name={`stepDuration_${index}`}
                  type="number"
                  min="1"
                  value={step.estimatedDurationMinutes}
                  onChange={(event) =>
                    setStepField(index, 'estimatedDurationMinutes', event.target.value)
                  }
                  error={fieldErrors[`step_${index}_estimatedDurationMinutes`]}
                  helperText="Facultatif"
                />
                <Input
                  label="Titre de l'étape"
                  name={`stepTitle_${index}`}
                  required
                  value={step.title}
                  onChange={(event) => setStepField(index, 'title', event.target.value)}
                  error={fieldErrors[`step_${index}_title`]}
                />
                <TextAreaField
                  label="Description"
                  name={`stepDescription_${index}`}
                  required
                  rows={2}
                  value={step.description}
                  onChange={(event) => setStepField(index, 'description', event.target.value)}
                  error={fieldErrors[`step_${index}_description`]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="charter-form-actions">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Annuler
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default CharterForm
