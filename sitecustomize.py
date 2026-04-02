"""Project-wide Python startup customizations.

This keeps third-party Python 3.11 async deprecation noise from overwhelming
test output while leaving application warnings intact.
"""

from __future__ import annotations

import warnings


warnings.filterwarnings(
    "ignore",
    message=r"The configuration option \"asyncio_default_fixture_loop_scope\" is unset\..*",
    category=Warning,
)
warnings.filterwarnings(
    "ignore",
    message=r"Passing 'msg' argument to Task\.cancel\(\) is deprecated since Python 3\.11.*",
    category=DeprecationWarning,
)
warnings.filterwarnings(
    "ignore",
    message=r"Passing 'msg' argument to Future\.cancel\(\) is deprecated since Python 3\.11.*",
    category=DeprecationWarning,
)
