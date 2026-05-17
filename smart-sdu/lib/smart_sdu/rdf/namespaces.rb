# frozen_string_literal: true

module SmartSdu
  module Rdf
    module Namespaces
      autoload :SmartNamespace, "#{__dir__}/namespaces/smart_namespace"
      autoload :OaNamespace, "#{__dir__}/namespaces/oa_namespace"
      autoload :IsoIec80000Namespace, "#{__dir__}/namespaces/isoiec80000_namespace"
    end
  end
end
