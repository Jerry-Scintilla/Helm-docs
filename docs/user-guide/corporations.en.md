# Corporation Management

The Corporation page shows overall data for your corporation, including the member list and financial information. Accessing the corporation page requires appropriate permissions.

## Navigating to the Corporation Page

**Option 1:** **Sidebar → Corporation** to view your current corporation.

**Option 2:** On a character detail page, click the character's **corporation name** link to navigate to that corporation page.

## Corporation Overview

The corporation overview displays:

| Field | Description |
|-------|-------------|
| Corporation Name | Full corporation name |
| Ticker | \[TICK\] |
| Alliance | Current alliance (if applicable) |
| Member Count | Current number of corporation members |
| Founded | Corporation creation date |
| CEO | Corporation CEO character name |
| Description | Corporation bio (as set in EVE) |

## Member List

The Member List tab shows all corporation members:

- Character name and portrait
- Date joined corporation
- Character's alliance (if in an alliance corp)
- Supports searching by character name

!!! note "Permission Required"
    Viewing the member list typically requires `corporation.view_members` permission or higher. ESI data requires the `esi-corporations.read_corporation_membership.v1` scope.

## Corporation Finances

The Finances tab (requires `corporation.view_finances` permission) shows:

- **Corp wallet balances**: ISK balance per wallet division (Division 1–7)
- **Journal**: income and expense details with timestamp, type, amount, and notes

## Corporation Mail

The Mail tab (requires appropriate permission) shows mail sent to all members, in the same format as character mail.

## Corporation Assets

The Assets tab (requires `corporation.view_assets` permission) shows all corporation-owned assets, including:
- Corporate hangar contents
- Station inventory
- Docked ships

Each asset record shows the item icon (from the EVE image server), item name, location, and quantity.

## Data Refresh Frequency

Corporation data is periodically fetched from ESI by the Celery Worker:

| Data Type | Frequency |
|-----------|-----------|
| Basic info | 1 hour |
| Member list | 1 hour |
| Finances | 1 hour |
| Assets | 6 hours |
