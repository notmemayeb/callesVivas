Incident has various states:

- Reported (Creado) — `DETECTED`:
    - Incident's author and moderators can see it, but it is still pending validation by moderator
    - Not visible to the general public
- Published (Publicado) — `PUBLISHED`:
    - Approved by moderation, public for everyone
- Contacted (En contacto con periódico) — `IN_CONTACT`:
    - Journalist recognised incident, auto-transitions when journalistic content is added
- Contacted with public services (En contacto administrativo) — `ADMIN_CONTACT`:
    - Public services recognised incident, auto-transitions when admin contact is added
- Measures announced (Medidas anunciadas) — `MEASURES_ANNOUNCED`:
    - Administration announced measures to address the issue
- Awaiting response (En espera) — `AWAITING_RESPONSE`:
    - Waiting for administration response (deadline)
- Resolved (Resuelto) — `RESOLVED`:
    - Issue fixed
- Abandoned (Abandonado) — `ABANDONED`:
    - Public services denied to act, or incident rejected by moderation

State transitions:
- DETECTED → PUBLISHED (moderator approves) or ABANDONED (moderator rejects)
- PUBLISHED → IN_CONTACT, ABANDONED
- IN_CONTACT → ADMIN_CONTACT, RESOLVED, ABANDONED
- ADMIN_CONTACT → MEASURES_ANNOUNCED, AWAITING_RESPONSE, RESOLVED, ABANDONED
- MEASURES_ANNOUNCED → RESOLVED, AWAITING_RESPONSE, ABANDONED
- AWAITING_RESPONSE → RESOLVED, ABANDONED
