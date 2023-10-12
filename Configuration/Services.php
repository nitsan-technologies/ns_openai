<?php

use NITSAN\NsOpenai\Factory\SelectedModelFactory;
use NITSAN\NsOpenai\Helper\NsExtensionConfiguration;
use NITSAN\NsOpenai\Hooks\TranslateHook;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ReferenceConfigurator;
use TYPO3\CMS\Core\Configuration\ExtensionConfiguration;
use NITSAN\NsOpenai\Domain\Repository\PageRepository;
use TYPO3\CMS\Core\Log\LogManager;
use Psr\Log\LoggerInterface;
use NITSAN\NsOpenai\Service\NsOpenAiContentService;
use NITSAN\NsOpenai\Factory\CustomLanguageFactory;
use NITSAN\NsOpenai\Controller\OpenAiController;
use TYPO3\CMS\Extbase\Mvc\Web\Routing\UriBuilder;

return static function (ContainerConfigurator $containerConfigurator, ContainerBuilder $containerBuilder): void {
    $services = $containerConfigurator->services();
    $services->defaults()
        ->private()
        ->autowire()
        ->autoconfigure();

    $services->load('NITSAN\\NsOpenai\\', __DIR__ . '/../Classes/')
        ->exclude([
            __DIR__ . '/../Classes/Domain/Model',
        ]);

    $services->set('ExtConf.nsOpenai', 'array')
        ->factory([new ReferenceConfigurator(ExtensionConfiguration::class), 'get'])
        ->args([
            'ns_openai'
        ]);

    $services->set('CustomLanguageArray', 'array')
        ->factory([new ReferenceConfigurator(CustomLanguageFactory::class), 'getCustomLanguages']);

    $services->set('SelectedModel', 'bool')
        ->factory([new ReferenceConfigurator(SelectedModelFactory::class), 'checkSelectedModel'])
        ->arg('$extConf', new ReferenceConfigurator('ExtConf.nsOpenai'));

    $containerBuilder->register('Logger', LoggerInterface::class);
    $services->set('PsrLogInterface', 'Logger')
        ->factory([
            new ReferenceConfigurator(LogManager::class), 'getLogger'
        ]);

    $services->set(NsOpenAiContentService::class)
        ->arg('$languages', new ReferenceConfigurator('CustomLanguageArray'))
        ->arg('$extConf', new ReferenceConfigurator('ExtConf.nsOpenai'))
        ->arg('$nonLegacyModel', new ReferenceConfigurator('SelectedModel'))
        ->arg('$uriBuilder', new ReferenceConfigurator(UriBuilder::class));

    $services->set(OpenAiController::class)
        ->arg('$contentService', new ReferenceConfigurator(NsOpenAiContentService::class))
        ->arg('$logger', new ReferenceConfigurator('PsrLogInterface'))
        ->arg('$pageRepository', new ReferenceConfigurator(PageRepository::class))
        ->public();

    $services->set(NsExtensionConfiguration::class)
        ->public();

    $services->set(\NITSAN\NsOpenai\Backend\PageLayoutHeader::class)
        ->arg('$extensionConfiguration', new ReferenceConfigurator(NsExtensionConfiguration::class))
        ->arg('$pageRepository', new ReferenceConfigurator(PageRepository::class))
        ->public();
};
