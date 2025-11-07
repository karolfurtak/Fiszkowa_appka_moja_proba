# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

Celem projektu 10xCards jest stworzenie aplikacji internetowej, która minimalizuje wysiłek i czas potrzebny na tworzenie fiszek edukacyjnych poprzez wykorzystanie sztucznej inteligencji. Aplikacja ma na celu ułatwienie studentom i uczniom regularnego korzystania z metody nauki opartej na powtórkach interwałowych (spaced repetition). Użytkownicy będą mogli wkleić tekst, z którego AI automatycznie wygeneruje zestaw interaktywnych fiszek w formie testu wielokrotnego wyboru, a następnie uczyć się z nich w dedykowanych trybach nauki.

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek jest procesem żmudnym, czasochłonnym i często zniechęcającym. Studenci, zwłaszcza na kierunkach lingwistycznych, technicznych i medycznych, muszą przyswajać ogromne ilości informacji, a bariera związana z przygotowaniem materiałów do nauki sprawia, że rezygnują z jednej z najskuteczniejszych metod zapamiętywania. Brak jest prostego i szybkiego narzędzia, które automatyzuje ten proces od początku do końca.

## 3. Wymagania funkcjonalne

- F-001: System rejestracji i logowania użytkowników na podstawie adresu e-mail i hasła.
- F-002: Możliwość generowania fiszek z wklejonego tekstu przy użyciu modelu AI.
- F-003: AI automatycznie identyfikuje dziedzinę wiedzy na podstawie tekstu.
- F-004: Fiszki generowane są w formacie testu jednokrotnego wyboru (pytanie, 1 poprawna odpowiedź, 3 błędne odpowiedzi).
- F-005: Ekran weryfikacji, na którym użytkownik może akceptować, odrzucać i edytować (regenerować dystraktory) wygenerowane fiszki.
- F-006: Możliwość manualnego tworzenia fiszek.
- F-007: Możliwość dodawania obrazków do fiszek poprzez link URL.
- F-008: Organizacja fiszek w zbiory zwane "taliami".
- F-009: Dwa tryby nauki: "Tryb treningu" (spaced repetition) i "Tryb nauki" (swobodne przeglądanie - widoczna tylko prawidłowa odpowiedź).
- F-010: Algorytm powtórek oparty na prostym mechanizmie (poprawna odpowiedź wydłuża interwał, błędna go resetuje).
- F-011: Automatyczne archiwizowanie fiszek po 30 kolejnych poprawnych odpowiedziach (status "Opanowana").
- F-012: Pulpit główny z listą talii i informacją o liczbie fiszek do powtórki.
- F-013: Podstawowe zarządzanie kontem (zmiana hasła, usunięcie konta).

## 4. Granice produktu

### W zakresie MVP:
- Aplikacja internetowa (desktop-first).
- Prosty system kont użytkowników (e-mail + hasło).
- Generowanie fiszek z tekstu (kopiuj-wklej).
- Manualne tworzenie fiszek.
- Manualne wyświetlanie fiszek w "Moje fiszki"
- System talii.
- Prosty algorytm spaced repetition (korzystamy z gotowego rozwiązania, biblioteki open-source).
- Dodawanie obrazków przez URL.

### Poza zakresem MVP:
- Aplikacja dla ANBERNIC RG40XX V.
- Aplikacje mobilne.
- Import plików (PDF, DOCX).
- Współdzielenie talii między użytkownikami.
- Zaawansowany edytor tekstu (formatowanie, kolory).
- Przesyłanie obrazków z dysku.
- Integracje z innymi platformami.
- Zaawansowane algorytmy powtórek (np. SuperMemo, Anki).

## 5. Historyjki użytkowników

### Uwierzytelnianie i Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, aby móc zapisywać swoje fiszki i postępy w nauce.
- Kryteria akceptacji:
  1. Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
  2. Walidacja sprawdza, czy e-mail ma poprawny format i nie jest już zajęty.
  3. Walidacja sprawdza, czy hasła w obu polach są identyczne.
  4. Po pomyślnej rejestracji jestem automatycznie zalogowany i przekierowany na ekran onboardingu.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do moich talii i kontynuować naukę.
- Kryteria akceptacji:
  1. Formularz logowania zawiera pola na adres e-mail i hasło.
  2. Po poprawnym wprowadzeniu danych jestem przekierowany na pulpit główny.
  3. W przypadku błędnych danych wyświetlany jest stosowny komunikat.

- ID: US-003
- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć dostęp do mojego konta na współdzielonym urządzeniu.
- Kryteria akceptacji:
  1. W interfejsie użytkownika znajduje się przycisk "Wyloguj".
  2. Po kliknięciu zostaję wylogowany i przekierowany na stronę główną.

- ID: US-004
- Tytuł: Zmiana hasła
- Opis: Jako zalogowany użytkownik, chcę mieć możliwość zmiany mojego hasła, aby zabezpieczyć swoje konto.
- Kryteria akceptacji:
  1. W ustawieniach konta znajduje się opcja zmiany hasła.
  2. Formularz wymaga podania starego hasła, nowego hasła i jego potwierdzenia.
  3. Po pomyślnej zmianie hasła otrzymuję komunikat potwierdzający.

- ID: US-005
- Tytuł: Usunięcie konta
- Opis: Jako użytkownik, chcę mieć możliwość trwałego usunięcia mojego konta i wszystkich moich danych.
- Kryteria akceptacji:
  1. W ustawieniach konta znajduje się opcja usunięcia konta.
  2. Operacja wymaga potwierdzenia przez użytkownika w oknie dialogowym.
  3. Po potwierdzeniu, wszystkie dane użytkownika (konto, talie, fiszki) są trwale usuwane.

### Zarządzanie Taliami i Fiszkami

- ID: US-006
- Tytuł: Widok pulpitu z taliami
- Opis: Jako zalogowany użytkownik, po wejściu do aplikacji chcę widzieć pulpit z listą wszystkich moich talii, abym mógł szybko wybrać, z czego chcę się uczyć.
- Kryteria akceptacji:
  1. Pulpit wyświetla talie w formie siatki lub listy.
  2. Każda talia na liście pokazuje swoją nazwę oraz liczbę fiszek do powtórki na dziś.
  3. Jeśli nie mam żadnych talii, widzę ekran powitalny z zachętą do stworzenia pierwszej.

- ID: US-007
- Tytuł: Usuwanie talii lub wybranych fiszek
- Opis: Jako użytkownik, chcę móc usunąć wybraną talię lub wybraną fiszkę w talii, aby pozbyć się niepotrzebnych materiałów.
- Kryteria akceptacji:
  1. Przy każdej talii znajduje się opcja jej usunięcia.
  2. Przy każdej fiszce w trybie nauki znajduje się opcja jej usunięcia.
  3. Przed usunięciem wyświetlane jest okno dialogowe z prośbą o potwierdzenie.
  4. Usunięcie talii kasuje wszystkie należące do niej fiszki, w tym te "Opanowane".

- ID: US-008
- Tytuł: Inicjowanie generowania fiszek
- Opis: Jako użytkownik, chcę móc wkleić tekst do generatora i rozpocząć proces tworzenia fiszek, aby zaoszczędzić czas.
- Kryteria akceptacji:
  1. Na stronie głównej lub w widoku talii znajduje się wyraźny przycisk prowadzący do generatora.
  2. Generator zawiera duże pole tekstowe na wklejenie materiału.
  3. Po wklejeniu tekstu i kliknięciu "Generuj" rozpoczyna się proces analizy.

- ID: US-009
- Tytuł: Proces weryfikacji fiszek
- Opis: Jako użytkownik, po wygenerowaniu fiszek przez AI chcę mieć możliwość ich przejrzenia i zatwierdzenia, aby upewnić się co do ich jakości.
- Kryteria akceptacji:
  1. Ekran weryfikacji wyświetla listę wygenerowanych fiszek (pytanie i 4 odpowiedzi).
  2. Przy każdej fiszce znajdują się przyciski "Akceptuj" i "Odrzuć".
  3. Domyślnie wszystkie fiszki są zaznaczone jako "zaakceptowane".
  4. Mogę zapisać tylko zaakceptowane fiszki.

- ID: US-010
- Tytuł: Korekta dziedziny wiedzy
- Opis: Jako użytkownik, chcę widzieć, jaką dziedzinę wiedzy wykryło AI i mieć możliwość jej zmiany, aby poprawić jakość generowanych odpowiedzi.
- Kryteria akceptacji:
  1. Na ekranie weryfikacji wyświetlana jest informacja "Wykryta dziedzina: [nazwa]. [Zmień]".
  2. Kliknięcie "Zmień" pozwala na wpisanie innej dziedziny z wcześniej zdefiniowanych z rozwijalnego menu lub dodanie nowej.

- ID: US-011
- Tytuł: Regeneracja błędnych odpowiedzi
- Opis: Jako użytkownik, jeśli nie podobają mi się błędne odpowiedzi wygenerowane przez AI, chcę mieć możliwość ich szybkiej regeneracji.
- Kryteria akceptacji:
  1. Na każdej fiszce na ekranie weryfikacji znajduje się ikona "Odśwież".
  2. Kliknięcie ikony wysyła zapytanie do AI o wygenerowanie 3 nowych dystraktorów dla tej konkretnej fiszki.

- ID: US-012
- Tytuł: Zapisywanie fiszek do talii
- Opis: Jako użytkownik, po weryfikacji fiszek chcę móc zapisać je do nowej lub istniejącej talii.
- Kryteria akceptacji:
  1. Po weryfikacji mogę wybrać istniejącą talię z listy rozwijanej lub wpisać nazwę nowej talii.
  2. Po zapisaniu jestem przekierowywany do widoku tej talii z komunikatem o sukcesie.

- ID: US-013
- Tytuł: Manualne tworzenie fiszki
- Opis: Jako użytkownik, chcę móc ręcznie dodać pojedynczą fiszkę, gdy mam konkretne pytanie, którego nie ma w tekście źródłowym.
- Kryteria akceptacji:
  1. Formularz tworzenia fiszki zawiera pola na pytanie, poprawną odpowiedź i opcjonalny URL obrazka.
  2. Po wpisaniu tych danych mogę kliknąć przycisk, aby AI wygenerowało 3 błędne odpowiedzi.
  3. Mogę zapisać w pełni utworzoną fiszkę do wybranej talii.

### Proces Nauki

- ID: US-014
- Tytuł: Rozpoczęcie sesji treningowej
- Opis: Jako użytkownik, chcę móc rozpocząć sesję treningową z wybranej talii, aby powtórzyć materiał zaplanowany na dziś.
- Kryteria akceptacji:
  1. W widoku talii znajduje się przycisk "Rozpocznij powtórkę".
  2. Po kliknięciu rozpoczyna się sesja testowa, prezentująca tylko fiszki, których termin powtórki minął.
  3. Jeśli nie ma fiszek do powtórki, wyświetlany jest odpowiedni komunikat.

- ID: US-015
- Tytuł: Odpowiadanie na pytanie w teście
- Opis: Jako użytkownik w trakcie sesji treningowej, chcę widzieć pytanie i wybierać jedną z czterech losowo ułożonych odpowiedzi.
- Kryteria akceptacji:
  1. Interfejs pokazuje pytanie i 4 możliwe odpowiedzi.
  2. Kolejność odpowiedzi jest losowa przy każdym wyświetleniu pytania.
  3. Po wybraniu odpowiedzi system natychmiast informuje mnie, czy była ona poprawna.

- ID: US-016
- Tytuł: Zakończenie i podsumowanie sesji treningowej
- Opis: Jako użytkownik, po zakończeniu sesji powtórkowej chcę zobaczyć podsumowanie moich wyników, aby ocenić swoje postępy.
- Kryteria akceptacji:
  1. Po przejściu przez wszystkie zaplanowane fiszki pojawia się ekran podsumowania.
  2. Podsumowanie zawiera wynik (np. 8/10) oraz listę pytań, na które odpowiedziałem niepoprawnie.

- ID: US-017
- Tytuł: Korzystanie z trybu nauki
- Opis: Jako użytkownik, chcę mieć możliwość swobodnego przeglądania wszystkich fiszek w talii w formie odwracanych kart, aby zapoznać się z materiałem.
- Kryteria akceptacji:
  1. W widoku talii znajduje się przycisk "Tryb nauki".
  2. Interfejs pokazuje fiszkę z widocznym pytaniem.
  3. Kliknięcie na fiszkę odsłania odpowiedź.
  4. Dostępne są przyciski lub gesty do nawigacji między fiszkami.

- ID: US-018
- Tytuł: Zarządzanie "Opanowanymi" fiszkami
- Opis: Jako użytkownik, chcę mieć dostęp do listy fiszek, które już opanowałem, oraz możliwość przywrócenia ich do nauki.
- Kryteria akceptacji:
  1. W aplikacji istnieje dedykowany widok "Opanowane".
  2. Fiszki w tym widoku są pogrupowane według talii.
  3. Przy każdej fiszce jest opcja "Przywróć do nauki", która resetuje jej postęp i dodaje z powrotem do cyklu powtórek.

## 6. Metryki sukcesu

- MS-001: Procent akceptacji fiszek AI: Co najmniej 75% fiszek generowanych przez AI jest akceptowanych przez użytkowników na ekranie weryfikacji.
- MS-002: Procent wykorzystania AI: Co najmniej 75% wszystkich nowo tworzonych fiszek w systemie pochodzi z generatora AI.
- MS-003: Retencja użytkowników: Śledzenie retencji użytkowników po 1, 7 i 30 dniach od rejestracji.
- MS-004: Aktywność użytkowników: Mierzenie liczby dziennych aktywnych użytkowników (DAU).
