import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, AlertCircle, CheckCircle2, FileText } from 'lucide-react'
import incidentService from '../../services/incidentService'
import categoryService from '../../services/categoryService'
import serviceService from '../../services/serviceService'
import attachmentService from '../../services/attachmentService'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt', 'csv', 'docx', 'xlsx', 'log']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const CreateIncidentPage = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState('MOYENNE')
  const [categoryId, setCategoryId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [file, setFile] = useState(null)

  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])

  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [cats, srvs] = await Promise.all([
          categoryService.getAllCategories({ activeOnly: true }),
          serviceService.getAllServices({ activeOnly: true })
        ])
        setCategories(cats || [])
        setServices(srvs || [])
        if (cats && cats.length > 0) setCategoryId(cats[0].id)
        if (srvs && srvs.length > 0) setServiceId(srvs[0].id)
      } catch (err) {
        setGlobalError("Impossible de charger les listes de catégories et de services.")
      }
    }
    loadDependencies()
  }, [])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) {
      setFile(null)
      return
    }

    const extension = selectedFile.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFieldErrors((prev) => ({
        ...prev,
        file: `Format .${extension} non autorisé. Formats acceptés : ${ALLOWED_EXTENSIONS.join(', ')}`
      }))
      setFile(null)
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFieldErrors((prev) => ({
        ...prev,
        file: 'La taille du fichier ne doit pas dépasser 10 Mo.'
      }))
      setFile(null)
      return
    }

    setFieldErrors((prev) => ({ ...prev, file: '' }))
    setFile(selectedFile)
  }

  const validateForm = () => {
    const errors = {}

    if (!title.trim()) {
      errors.title = 'Le titre est obligatoire'
    } else if (title.trim().length > 150) {
      errors.title = 'Le titre ne doit pas dépasser 150 caractères'
    }

    if (!description.trim()) {
      errors.description = 'La description détaillée est obligatoire'
    }

    if (!categoryId) {
      errors.categoryId = 'Veuillez sélectionner une catégorie'
    }

    if (!serviceId) {
      errors.serviceId = 'Veuillez sélectionner un service'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        priority,
        categoryId: Number(categoryId),
        serviceId: Number(serviceId)
      }

      const createdIncident = await incidentService.createIncident(payload)

      if (file && createdIncident?.id) {
        try {
          await attachmentService.uploadAttachment(createdIncident.id, file)
        } catch {
        }
      }

      setSuccessMessage(`L'incident ${createdIncident.reference} a été déclaré avec succès.`)
      setTimeout(() => {
        navigate(`/incidents/${createdIncident.id}`)
      }, 1200)
    } catch (err) {
      setGlobalError(err.message || "Erreur lors de la création de l'incident.")
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/incidents"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Retour à la liste des incidents
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Déclarer un nouvel incident</h1>
          <p className="page-subtitle">
            Renseignez les détails du dysfonctionnement constaté pour transmission aux équipes techniques
          </p>
        </div>
      </div>

      {globalError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: '20px'
          }}
        >
          <AlertCircle size={18} />
          <span>{globalError}</span>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: '20px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage} Redirection en cours...</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Titre de l'incident"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }))
            }}
            placeholder="Ex : Panne de la climatisation centrale salle serveurs"
            error={fieldErrors.title}
            required
            disabled={submitting}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="categoryId">
                Catégorie <span className="input-required">*</span>
              </label>
              <select
                id="categoryId"
                className={`filter-select ${fieldErrors.categoryId ? 'input-error' : ''}`}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  if (fieldErrors.categoryId) setFieldErrors((prev) => ({ ...prev, categoryId: '' }))
                }}
                disabled={submitting}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <span className="input-error-text">{fieldErrors.categoryId}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="serviceId">
                Service concerné <span className="input-required">*</span>
              </label>
              <select
                id="serviceId"
                className={`filter-select ${fieldErrors.serviceId ? 'input-error' : ''}`}
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value)
                  if (fieldErrors.serviceId) setFieldErrors((prev) => ({ ...prev, serviceId: '' }))
                }}
                disabled={submitting}
              >
                <option value="">Sélectionner un service</option>
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name}
                  </option>
                ))}
              </select>
              {fieldErrors.serviceId && (
                <span className="input-error-text">{fieldErrors.serviceId}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Localisation / Emplacement"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex : Bâtiment B, 2ème étage, Salle 204"
              disabled={submitting}
            />

            <div className="input-group">
              <label className="input-label" htmlFor="priority">
                Priorité souhaitée
              </label>
              <select
                id="priority"
                className="filter-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={submitting}
              >
                <option value="BASSE">Basse (Incidence mineure)</option>
                <option value="MOYENNE">Moyenne (Fonctionnement dégradé)</option>
                <option value="HAUTE">Haute (Blocage d'activité partielle)</option>
                <option value="CRITIQUE">Critique (Arrêt critique de service)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="description">
              Description détaillée <span className="input-required">*</span>
            </label>
            <textarea
              id="description"
              className={`input-field ${fieldErrors.description ? 'input-error' : ''}`}
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }))
              }}
              placeholder="Décrivez précisément les symptômes observés, les équipements concernés et les circonstances..."
              disabled={submitting}
            />
            {fieldErrors.description && (
              <span className="input-error-text">{fieldErrors.description}</span>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="attachment">
              Pièce jointe (facultatif - max 10 Mo)
            </label>
            <input
              id="attachment"
              type="file"
              onChange={handleFileChange}
              disabled={submitting}
              style={{ fontSize: '0.875rem' }}
            />
            {file && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--color-blue-700)', fontSize: '0.813rem' }}>
                <FileText size={14} />
                <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} Mo)</span>
              </div>
            )}
            {fieldErrors.file && (
              <span className="input-error-text">{fieldErrors.file}</span>
            )}
            <span className="input-helper-text">
              Formats acceptés : PDF, PNG, JPG, WEBP, TXT, CSV, DOCX, XLSX, LOG
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Link to="/incidents" className="btn btn-outline btn-md">
              Annuler
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={submitting}
            >
              Soumettre l'incident
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateIncidentPage
