#$(shell node .bem/makefile.js -o _GNUmakefile)
#include _GNUmakefile

define newline


endef
$(eval $(subst ъ,$(newline),$(shell node .bem/makefile.js | tr '\n' 'ъ')))

