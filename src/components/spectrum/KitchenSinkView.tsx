import * as React from "react"
import {
  SpectrumButton,
  SpectrumInput,
  SpectrumCard,
  SpectrumCardHeader,
  SpectrumCardTitle,
  SpectrumCardDescription,
  SpectrumCardContent,
  SpectrumCardFooter,
  SpectrumDialog,
  SpectrumDialogTrigger,
  SpectrumDialogContent,
  SpectrumDialogHeader,
  SpectrumDialogTitle,
  SpectrumDialogDescription,
  SpectrumDialogBody,
  SpectrumDialogFooter,
  SpectrumForm,
  SpectrumFieldset,
  SpectrumFormGroup,
  SpectrumList,
  SpectrumListItem,
  spectrumToast,
  toast,
  SpectrumProgress,
  SpectrumSkeleton,
  SpectrumNavigation,
} from "./index"
import {
  Mail,
  Lock,
  User,
  Home,
  Settings,
  Search,
  Check,
  AlertCircle,
  Star,
  Heart,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
} from "lucide-react"

export default function KitchenSinkView() {
  const [progress, setProgress] = React.useState(45)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    name: "",
  })
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.email) errors.email = "Email jest wymagany"
    if (!formData.password) errors.password = "Hasło jest wymagane"
    if (formData.password.length < 8) {
      errors.password = "Hasło musi mieć co najmniej 8 znaków"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const navItems = [
    { id: "home", label: "Strona główna", icon: Home, href: "/" },
    { id: "settings", label: "Ustawienia", icon: Settings, href: "/settings" },
    { id: "search", label: "Wyszukaj", icon: Search, onClick: () => {} },
  ]

  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Adobe Spectrum Design System - Kitchen Sink
        </h1>
        <p className="text-muted-foreground text-lg">
          Prezentacja wszystkich komponentów zgodnych z wytycznymi Adobe Spectrum
        </p>
      </div>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <SpectrumCard>
          <SpectrumCardHeader>
            <SpectrumCardTitle>Warianty przycisków</SpectrumCardTitle>
            <SpectrumCardDescription>
              Różne warianty i rozmiary przycisków
            </SpectrumCardDescription>
          </SpectrumCardHeader>
          <SpectrumCardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Warianty</h3>
              <div className="flex flex-wrap gap-3">
                <SpectrumButton variant="primary">Primary</SpectrumButton>
                <SpectrumButton variant="secondary">Secondary</SpectrumButton>
                <SpectrumButton variant="quiet">Quiet</SpectrumButton>
                <SpectrumButton variant="destructive">Destructive</SpectrumButton>
                <SpectrumButton variant="destructive-quiet">
                  Destructive Quiet
                </SpectrumButton>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Rozmiary</h3>
              <div className="flex flex-wrap items-center gap-3">
                <SpectrumButton size="small">Small</SpectrumButton>
                <SpectrumButton size="default">Default</SpectrumButton>
                <SpectrumButton size="large">Large</SpectrumButton>
                <SpectrumButton size="icon" aria-label="Icon button">
                  <Plus className="h-4 w-4" />
                </SpectrumButton>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Stany</h3>
              <div className="flex flex-wrap gap-3">
                <SpectrumButton disabled>Disabled</SpectrumButton>
                <SpectrumButton loading>Loading</SpectrumButton>
                <SpectrumButton variant="primary">
                  <Download className="h-4 w-4" />
                  Z ikoną
                </SpectrumButton>
              </div>
            </div>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* Inputs Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Inputs</h2>
        <SpectrumCard>
          <SpectrumCardHeader>
            <SpectrumCardTitle>Pola tekstowe</SpectrumCardTitle>
            <SpectrumCardDescription>
              Różne stany i warianty pól tekstowych
            </SpectrumCardDescription>
          </SpectrumCardHeader>
          <SpectrumCardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SpectrumInput
                label="Email"
                type="email"
                placeholder="twoj@email.pl"
                required
                leftIcon={<Mail className="h-4 w-4" />}
                helperText="Wprowadź poprawny adres email"
              />

              <SpectrumInput
                label="Hasło"
                type="password"
                placeholder="••••••••"
                required
                leftIcon={<Lock className="h-4 w-4" />}
                helperText="Minimum 8 znaków"
              />

              <SpectrumInput
                label="Imię"
                placeholder="Jan"
                leftIcon={<User className="h-4 w-4" />}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />

              <SpectrumInput
                label="Email z błędem"
                type="email"
                placeholder="niepoprawny@email"
                error="Niepoprawny format email"
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SpectrumCard variant="default">
            <SpectrumCardHeader>
              <SpectrumCardTitle>Default Card</SpectrumCardTitle>
              <SpectrumCardDescription>
                Standardowa karta z cieniem
              </SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <p className="text-sm">To jest zawartość karty.</p>
            </SpectrumCardContent>
            <SpectrumCardFooter>
              <SpectrumButton size="small">Akcja</SpectrumButton>
            </SpectrumCardFooter>
          </SpectrumCard>

          <SpectrumCard variant="quiet">
            <SpectrumCardHeader>
              <SpectrumCardTitle>Quiet Card</SpectrumCardTitle>
              <SpectrumCardDescription>Karta bez cienia</SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <p className="text-sm">Minimalistyczny wygląd.</p>
            </SpectrumCardContent>
          </SpectrumCard>

          <SpectrumCard variant="interactive">
            <SpectrumCardHeader>
              <SpectrumCardTitle>Interactive Card</SpectrumCardTitle>
              <SpectrumCardDescription>Karta z efektem hover</SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <p className="text-sm">Najedź myszką.</p>
            </SpectrumCardContent>
          </SpectrumCard>

          <SpectrumCard variant="selected">
            <SpectrumCardHeader>
              <SpectrumCardTitle>Selected Card</SpectrumCardTitle>
              <SpectrumCardDescription>Wybrana karta</SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <p className="text-sm">Z wyróżnionym obramowaniem.</p>
            </SpectrumCardContent>
          </SpectrumCard>
        </div>
      </section>

      {/* Dialog Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dialog</h2>
        <SpectrumCard>
          <SpectrumCardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <SpectrumDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <SpectrumDialogTrigger asChild>
                  <SpectrumButton>Otwórz Dialog (Small)</SpectrumButton>
                </SpectrumDialogTrigger>
                <SpectrumDialogContent size="small">
                  <SpectrumDialogHeader>
                    <SpectrumDialogTitle>Mały Dialog</SpectrumDialogTitle>
                    <SpectrumDialogDescription>
                      To jest przykład małego dialogu (480px szerokości)
                    </SpectrumDialogDescription>
                  </SpectrumDialogHeader>
                  <SpectrumDialogBody>
                    <p className="text-sm">
                      Dialog może zawierać różne treści. Tutaj jest przykładowy tekst.
                    </p>
                  </SpectrumDialogBody>
                  <SpectrumDialogFooter>
                    <SpectrumButton
                      variant="quiet"
                      onClick={() => setDialogOpen(false)}
                    >
                      Anuluj
                    </SpectrumButton>
                    <SpectrumButton onClick={() => setDialogOpen(false)}>
                      Zatwierdź
                    </SpectrumButton>
                  </SpectrumDialogFooter>
                </SpectrumDialogContent>
              </SpectrumDialog>

              <SpectrumDialog>
                <SpectrumDialogTrigger asChild>
                  <SpectrumButton variant="secondary">
                    Otwórz Dialog (Medium)
                  </SpectrumButton>
                </SpectrumDialogTrigger>
                <SpectrumDialogContent size="medium">
                  <SpectrumDialogHeader>
                    <SpectrumDialogTitle>Średni Dialog</SpectrumDialogTitle>
                    <SpectrumDialogDescription>
                      To jest przykład średniego dialogu (640px szerokości)
                    </SpectrumDialogDescription>
                  </SpectrumDialogHeader>
                  <SpectrumDialogBody>
                    <p className="text-sm mb-4">
                      Dialog może zawierać formularze, listy i inne komponenty.
                    </p>
                    <SpectrumInput
                      label="Przykładowe pole"
                      placeholder="Wprowadź tekst"
                    />
                  </SpectrumDialogBody>
                  <SpectrumDialogFooter>
                    <SpectrumButton variant="quiet">Anuluj</SpectrumButton>
                    <SpectrumButton>Zapisz</SpectrumButton>
                  </SpectrumDialogFooter>
                </SpectrumDialogContent>
              </SpectrumDialog>

              <SpectrumDialog>
                <SpectrumDialogTrigger asChild>
                  <SpectrumButton variant="quiet">
                    Otwórz Dialog (Large)
                  </SpectrumButton>
                </SpectrumDialogTrigger>
                <SpectrumDialogContent size="large">
                  <SpectrumDialogHeader>
                    <SpectrumDialogTitle>Duży Dialog</SpectrumDialogTitle>
                    <SpectrumDialogDescription>
                      To jest przykład dużego dialogu (800px szerokości)
                    </SpectrumDialogDescription>
                  </SpectrumDialogHeader>
                  <SpectrumDialogBody>
                    <p className="text-sm mb-4">
                      Duży dialog może pomieścić więcej treści, formularzy i komponentów.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <SpectrumInput label="Pole 1" placeholder="Wartość 1" />
                      <SpectrumInput label="Pole 2" placeholder="Wartość 2" />
                    </div>
                  </SpectrumDialogBody>
                  <SpectrumDialogFooter>
                    <SpectrumButton variant="quiet">Anuluj</SpectrumButton>
                    <SpectrumButton>Zapisz</SpectrumButton>
                  </SpectrumDialogFooter>
                </SpectrumDialogContent>
              </SpectrumDialog>
            </div>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* Form Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Form</h2>
        <SpectrumCard>
          <SpectrumCardContent className="pt-6">
            <SpectrumForm
              title="Przykładowy formularz"
              description="Formularz z pełną walidacją i dostępnością"
              onSubmit={(e) => {
                e.preventDefault()
                if (validateForm()) {
                  toast.success("Formularz przesłany!", "Wszystkie pola są poprawne")
                } else {
                  toast.error("Błąd walidacji", "Sprawdź pola formularza")
                }
              }}
            >
              <SpectrumFieldset legend="Dane osobowe">
                <SpectrumFormGroup
                  label="Email"
                  required
                  error={formErrors.email}
                  helperText="Wprowadź poprawny adres email"
                >
                  <SpectrumInput
                    type="email"
                    placeholder="twoj@email.pl"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                </SpectrumFormGroup>

                <SpectrumFormGroup
                  label="Hasło"
                  required
                  error={formErrors.password}
                  helperText="Minimum 8 znaków"
                >
                  <SpectrumInput
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                  />
                </SpectrumFormGroup>
              </SpectrumFieldset>

              <div className="flex justify-end gap-3">
                <SpectrumButton type="button" variant="quiet">
                  Anuluj
                </SpectrumButton>
                <SpectrumButton type="submit">Zapisz</SpectrumButton>
              </div>
            </SpectrumForm>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* List Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">List</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SpectrumCard>
            <SpectrumCardHeader>
              <SpectrumCardTitle>Prosta lista</SpectrumCardTitle>
              <SpectrumCardDescription>Lista z podstawowymi elementami</SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <SpectrumList variant="simple" density="comfortable">
                <SpectrumListItem
                  primaryText="Element 1"
                  secondaryText="Opis elementu 1"
                  metadata="2024"
                />
                <SpectrumListItem
                  primaryText="Element 2"
                  secondaryText="Opis elementu 2"
                  metadata="2023"
                />
                <SpectrumListItem
                  primaryText="Element 3"
                  secondaryText="Opis elementu 3"
                  metadata="2022"
                />
              </SpectrumList>
            </SpectrumCardContent>
          </SpectrumCard>

          <SpectrumCard>
            <SpectrumCardHeader>
              <SpectrumCardTitle>Interaktywna lista</SpectrumCardTitle>
              <SpectrumCardDescription>
                Lista z możliwością wyboru elementu
              </SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <SpectrumList variant="interactive" density="comfortable">
                <SpectrumListItem
                  primaryText="Wybrany element"
                  secondaryText="To jest wybrany element"
                  selected={selectedItem === "1"}
                  onClick={() => setSelectedItem("1")}
                  leftIcon={<Star className="h-4 w-4" />}
                  rightIcon={<Check className="h-4 w-4" />}
                />
                <SpectrumListItem
                  primaryText="Element 2"
                  secondaryText="Kliknij, aby wybrać"
                  selected={selectedItem === "2"}
                  onClick={() => setSelectedItem("2")}
                  leftIcon={<Heart className="h-4 w-4" />}
                />
                <SpectrumListItem
                  primaryText="Element 3"
                  secondaryText="Kliknij, aby wybrać"
                  selected={selectedItem === "3"}
                  onClick={() => setSelectedItem("3")}
                  leftIcon={<Download className="h-4 w-4" />}
                  actions={
                    <div className="flex gap-1">
                      <SpectrumButton size="icon" variant="quiet" aria-label="Edytuj">
                        <Edit className="h-3 w-3" />
                      </SpectrumButton>
                      <SpectrumButton size="icon" variant="quiet" aria-label="Usuń">
                        <Trash2 className="h-3 w-3" />
                      </SpectrumButton>
                    </div>
                  }
                />
              </SpectrumList>
            </SpectrumCardContent>
          </SpectrumCard>
        </div>
      </section>

      {/* Toast Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast / Notifications</h2>
        <SpectrumCard>
          <SpectrumCardHeader>
            <SpectrumCardTitle>Powiadomienia</SpectrumCardTitle>
            <SpectrumCardDescription>
              Różne typy powiadomień
            </SpectrumCardDescription>
          </SpectrumCardHeader>
          <SpectrumCardContent>
            <div className="flex flex-wrap gap-3">
              <SpectrumButton
                onClick={() => toast.info("Informacja", "To jest wiadomość informacyjna")}
              >
                Info Toast
              </SpectrumButton>
              <SpectrumButton
                onClick={() =>
                  toast.success("Sukces!", "Operacja zakończona pomyślnie")
                }
              >
                Success Toast
              </SpectrumButton>
              <SpectrumButton
                onClick={() =>
                  toast.warning("Ostrzeżenie", "Uwaga na to działanie")
                }
              >
                Warning Toast
              </SpectrumButton>
              <SpectrumButton
                onClick={() => toast.error("Błąd", "Coś poszło nie tak")}
              >
                Error Toast
              </SpectrumButton>
            </div>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* Progress Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Progress</h2>
        <SpectrumCard>
          <SpectrumCardHeader>
            <SpectrumCardTitle>Wskaźniki postępu</SpectrumCardTitle>
            <SpectrumCardDescription>
              Linear i circular progress indicators
            </SpectrumCardDescription>
          </SpectrumCardHeader>
          <SpectrumCardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Linear Progress</h3>
              <SpectrumProgress
                value={progress}
                max={100}
                variant="linear"
                showLabel
                label="Postęp"
              />
              <SpectrumProgress variant="linear" label="Indeterminate" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Circular Progress</h3>
              <div className="flex flex-wrap gap-6">
                <div className="space-y-2">
                  <SpectrumProgress
                    value={progress}
                    max={100}
                    variant="circular"
                    size="small"
                    showLabel
                  />
                  <p className="text-xs text-muted-foreground text-center">Small</p>
                </div>
                <div className="space-y-2">
                  <SpectrumProgress
                    value={progress}
                    max={100}
                    variant="circular"
                    size="default"
                    showLabel
                  />
                  <p className="text-xs text-muted-foreground text-center">Default</p>
                </div>
                <div className="space-y-2">
                  <SpectrumProgress
                    value={progress}
                    max={100}
                    variant="circular"
                    size="large"
                    showLabel
                  />
                  <p className="text-xs text-muted-foreground text-center">Large</p>
                </div>
                <div className="space-y-2">
                  <SpectrumProgress variant="circular" size="default" />
                  <p className="text-xs text-muted-foreground text-center">
                    Indeterminate
                  </p>
                </div>
              </div>
            </div>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* Skeleton Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton</h2>
        <SpectrumCard>
          <SpectrumCardHeader>
            <SpectrumCardTitle>Loadery</SpectrumCardTitle>
            <SpectrumCardDescription>
              Skeleton loaders dla różnych typów treści
            </SpectrumCardDescription>
          </SpectrumCardHeader>
          <SpectrumCardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Text Skeleton</h3>
              <div className="space-y-2">
                <SpectrumSkeleton variant="text" width="100%" />
                <SpectrumSkeleton variant="text" width="80%" />
                <SpectrumSkeleton variant="text" width="60%" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Card Skeleton</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <SpectrumSkeleton variant="rectangular" width="100%" height="120px" />
                  <SpectrumSkeleton variant="text" width="100%" />
                  <SpectrumSkeleton variant="text" width="70%" />
                </div>
                <div className="space-y-2">
                  <SpectrumSkeleton variant="rectangular" width="100%" height="120px" />
                  <SpectrumSkeleton variant="text" width="100%" />
                  <SpectrumSkeleton variant="text" width="70%" />
                </div>
                <div className="space-y-2">
                  <SpectrumSkeleton variant="rectangular" width="100%" height="120px" />
                  <SpectrumSkeleton variant="text" width="100%" />
                  <SpectrumSkeleton variant="text" width="70%" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Avatar Skeleton</h3>
              <div className="flex items-center gap-4">
                <SpectrumSkeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                  <SpectrumSkeleton variant="text" width="60%" />
                  <SpectrumSkeleton variant="text" width="40%" />
                </div>
              </div>
            </div>
          </SpectrumCardContent>
        </SpectrumCard>
      </section>

      {/* Navigation Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Navigation</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SpectrumCard>
            <SpectrumCardHeader>
              <SpectrumCardTitle>Top Navigation</SpectrumCardTitle>
              <SpectrumCardDescription>
                Poziomy pasek nawigacji
              </SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <SpectrumNavigation
                variant="top"
                items={navItems}
                activeId="home"
              />
            </SpectrumCardContent>
          </SpectrumCard>

          <SpectrumCard>
            <SpectrumCardHeader>
              <SpectrumCardTitle>Sidebar Navigation</SpectrumCardTitle>
              <SpectrumCardDescription>
                Boczny panel nawigacji
              </SpectrumCardDescription>
            </SpectrumCardHeader>
            <SpectrumCardContent>
              <SpectrumNavigation
                variant="sidebar"
                items={navItems}
                activeId="settings"
                collapsed={false}
              />
            </SpectrumCardContent>
          </SpectrumCard>
        </div>
      </section>
    </div>
  )
}

