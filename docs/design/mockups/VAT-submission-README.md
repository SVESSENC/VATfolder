# VAT Submission Mockup

This file is a low-fidelity HTML mockup that represents the Danish VAT return (momsangivelse).

Files:
- `vat-submission.html` — mockup of the Danish VAT return boxes, including:
	- `Salgsmoms` (output VAT)
	- `Kobsmoms` (input VAT)
	- `Moms af varekøb i udlandet` (self-assessed goods purchase VAT)
	- `Moms af ydelseskøb i udlandet` (self-assessed services VAT)
	- `Rubrik A/B/C` value boxes (values excl. VAT)
	- Reconciliation notes, supporting evidence upload placeholder, and a calculated Net VAT preview

How to review
- Open `vat-submission.html` in a browser and try entering numeric values to see the live net VAT calculation.

Next steps
- Annotate each field with validation rules and data types (Decimal(18,2)).
- Add explicit API payload mapping (field names and JSON schema) and required evidence checklist per non-zero cross-border field.
